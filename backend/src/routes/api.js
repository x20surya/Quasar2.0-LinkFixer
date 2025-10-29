import express from "express";
import { Website, User } from "../models/user.js";
import { auth } from "../middleware/auth.js";
import scraper from "../utils/webscraper/scraper.js";
import { sendReport } from "../utils/mail/mail.js";
import { getReport } from "../utils/genAI/getReport.js";
import addWebsite from "./api/addWebsite.js";
import removeWebsite from "./api/deleteWebsite.js";
import scanWebsite from "./api/scanWebsite.js"


const router = express.Router();

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.use("/addWebsite", addWebsite);
router.use("/removeWebsite", removeWebsite);
router.use("/scanWebsite", scanWebsite);

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
      const aiReport = await getReport(data);
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

export default router;
