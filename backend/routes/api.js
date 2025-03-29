import express from "express";
import { Website, User } from "../models/user.js";
import { auth } from "../middleware/auth.js";
import scraper from "../WebScaper/scraper.js"

const router = express.Router();

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.post("/addWebsite", auth, async (req, res) => {
  const { startURL } = req.body;
  const user = await User.findById(req.user.id).select("-password").populate("websites");
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
    return res.status(400).json({ msg: "Please provide a valid URL strting with http:// or https://" });
  }

  try {
    const website = new Website({
      startURL,
      userID: req.user._id,
    });
    await website.save();
    user.websites.push({
      id: website._id,
      startURL: website.startURL,
    });
    await user.save();

    return res.status(201).json(website);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

router.post("/getStatus", auth, async (req, res) => {
  const { websiteID } = req.body
  let website
  try {
    website = await Website.findById(websiteID)
  }
  catch (err) {
    console.log(err)
    if(err.message === "Operation `websites.findOne()` buffering timed out after 10000ms") return res.status(400).json({ msg: "Website not found or Server Timed Out" })
    return res.status(400).json({ msg: err.message })
  }

  const startURL = website.startURL
  const auth = req.body.auth ? req.body.auth : "";
  const max = req.body.pages ? req.body.pages : 3;
  const data = scraper({ startURL, authentication: auth, maxPages: max })
    .then(data => {
      console.log(data)
      const { visitedUrls, brokenLinks, checkedLinks , timeElapsed} = data
      website.brokenLinks = brokenLinks
      website.checkedAt = Date.now()
      website.checkedLinks = checkedLinks
      website.estimatedTime = (website.estimatedTime +  timeElapsed)/2
      website.save()
      return res.status(200).json(data);
    })
    .catch(error => {
      console.error("Error during scraping:", error);
      return res.status(500).json({ msg: "Server error" });
    });
})

router.get("/getWebsites", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  console.log("Get Website")
  
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  let websites = []
  for (const website of user.websites) {
    const web = await Website.findById(website.id)
    websites.push({id : web._id, url : web.startURL, brokenLinks : web.brokenLinks, checkedLinks : web.checkedLinks, checkedAt : web.checkedAt})
  }
  console.log(websites)
  return res.status(200).json(websites);
});

router.post("/getStatusURL", auth, async (req, res) => {
  let { URL } = req.body
  const auth = req.body.auth ? req.body.auth : "";
  const max = req.body.pages ? req.body.pages : 3;
  if (!URL.startsWith("http://") && !URL.startsWith("https://")) {
    URL = "https://" + URL
  }
  const data = scraper({ startURL: URL, authentication: auth, maxPages: max })
    .then(data => {
      return res.status(200).json(data);
    })
    .catch(error => {
      console.error("Error during scraping:", error);
      return res.status(500).json({ msg: "Server error" });
    });
})


export default router;
