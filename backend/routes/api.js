import express from "express";
import { Website, User } from "../models/user.js";
import { auth } from "../middleware/auth.js";
import scraper from "../WebScaper/scraper.js";
import jwt from "jsonwebtoken";
import { sendReport } from "../config/mail.js";

import { GoogleGenAI } from "@google/genai";
import { addToQueue } from "../scheduler/logger.js";

const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });

const router = express.Router();

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.post("/addWebsite", auth, async (req, res) => {
  const { startURL } = req.body;
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("websites");
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  if (!startURL) {
    return res.status(400).json({ msg: "Please provide a start URL" });
  }

  if (user.websites.some((website) => website.startURL === startURL)) {
    return res.status(400).json({ msg: "Website already exists" });
  }
  if (!startURL.startsWith("http://") && !startURL.startsWith("https://")) {
    return res.status(400).json({
      msg: "Please provide a valid URL strting with http:// or https://",
    });
  }

  try {
    const website = new Website({
      startURL,
      userID: req.user.id,
    });
    await website.save();
    user.websites.push({
      id: website._id,
      startURL: website.startURL,
    });
    await user.save();
    addToQueue(website.id)
    return res.status(201).json(website);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/deleteWebsite", auth, async (req, res) => {
  const { id } = req.body;
  const userID = req.user.id;
  try {
    const website = await Website.findOneAndDelete({ _id: id, userID });
    if (website == null) throw new Error("Website not found");
    const user = await User.findById(userID);
    if (user == null) throw new Error("User Invalid");
    console.log(user);
    user.websites = user.websites.filter((web) => {
      return web.id !== id;
    });
    await user.save();
    await Website.findOneAndDelete({ _id: id, userID });
    return res.status(200).json({ msg: "deleted successfully" });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});

router.post("/getStatus", auth, async (req, res) => {
  const { websiteID } = req.body;
  let website;
  try {
    website = await Website.findById(websiteID);
  } catch (err) {
    console.log(err);
    if (
      err.message ===
      "Operation `websites.findOne()` buffering timed out after 10000ms"
    )
      return res
        .status(400)
        .json({ msg: "Website not found or Server Timed Out" });
    return res.status(400).json({ msg: err.message });
  }
  if (!website) {
    return res.status(404).json({ msg: "Website not found" });
  }
  const startURL = website.startURL;
  const auth = req.body.auth ? req.body.auth : "1234567890";
  const max = req.body.pages ? req.body.pages : 3;
  const data = scraper({ startURL, authentication: auth, maxPages: 100 })
    .then(async (data) => {
      const instructions = `Please analyze the following data and assume you are a web scraper who is reporting a data on each broken link of the website. also rate results from 1 to 10. Give me only the Analysis of broken links,  Data:`;
      const prompt = `${instructions}\n${JSON.stringify(data, null, 2)}`
      const aiReport = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      console.log(aiReport.text)
      console.log(data);
      const { visitedUrls, brokenLinks, checkedLinks, timeElapsed } = data;
      website.brokenLinks = brokenLinks;
      website.checkedAt = Date.now();
      website.checkedLinks = checkedLinks;
      if (website.estimatedTime == 0) website.estimatedTime = timeElapsed;
      else website.estimatedTime = (website.estimatedTime + timeElapsed) / 2;
      website.aiReport = aiReport.text;
      website.save();
      sendReport({
        url: startURL,
        brokenLinks,
        email: req.user.email,
        checkedLinks,
        aiReport : aiReport.text
      });
      return res.status(200).json({...data, aiReport : aiReport.text});
    })
    .catch((error) => {
      console.error("Error during scraping:", error);
      return res.status(500).json({ msg: "Server error" });
    });
});

router.get("/getWebsites", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  console.log("Get Website");

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  let websites = [];
  for (const website of user.websites) {
    const web = await Website.findById(website.id);
    websites.push({
      id: web._id,
      url: web.startURL,
      brokenLinks: web.brokenLinks,
      checkedLinks: web.checkedLinks,
      checkedAt: web.checkedAt,
      aiReport: web.aiReport
    });
  }
  console.log(websites);
  return res.status(200).json(websites);
});

router.get("/getAPIkey", auth, async (req, res) => {
  const id = req.body.user.id;
  const resp = jwt.sign({ id }, process.env.JWT_SECRET);
  return res.status(200).json({
    Key: resp,
  });
});

router.post("/getStatusURL", auth, async (req, res) => {
  let { URL, API_KEY } = req.body;
  jwt.verify(API_KEY, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ msg: "Invalid API key" });
    }
  });
  if (!URL) {
    return res.status(400).json({ msg: "Please provide a start URL" });
  }
  const auth = req.body.auth ? req.body.auth : "";
  const max = req.body.pages ? req.body.pages : 3;
  if (!URL.startsWith("http://") && !URL.startsWith("https://")) {
    URL = "https://" + URL;
  }
  const data = scraper({ startURL: URL, authentication: auth, maxPages: max })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((error) => {
      console.error("Error during scraping:", error);
      return res.status(500).json({ msg: "Server error" });
    });
});

export default router;
