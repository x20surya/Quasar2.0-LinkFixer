import { auth } from "../../middleware/auth.js";
import { User, Website } from "../../models/user.js";
import { Router } from "express";
import { parseSitemap } from "../../utils/website/sitemap.js";
import enqueue from "../../utils/scheduler/enqueue.js";

const router = Router();
router.post("/addWebsite", auth, async (req, res) => {
  let { link } = req.body;
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("websites");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!domain.includes("http")) {
    domain = "http://" + domain
  }
  if (!link) {
    return res.status(400).json({ error: "Please provide a start URL" });
  }
  const url = new URL(domain)

  const domain = url.hostname
  if (!domain) {
    return res.status(400).json({ error: "Please provide a start URL" });
  }

  if (user.websites.some((website) => website.domain === domain)) {
    return res.status(400).json({ error: "Website already exists" });
  }
  let reports = {}

  const sitemapURL = url.hostname + "/sitemap.xml"

  const sitemapLinks = await parseSitemap(sitemapURL)

  if (sitemapLinks.length === 0) {
    reports.sitemap = {
      error: `No links detected at ${sitemapURL}`
    }
  } else {
    reports.sitemap = {
      url: sitemapURL,
      links: sitemapLinks
    }
  }
  try {
    const website = new Website({
      domain,
      userID: req.user.id,
      checkedLinks: [],
      sitemapLinks: (sitemapLinks.length === 0) ? [link] : sitemapLinks
    });
    user.websites.push({
      id: website._id,
      domain: website.domain,
    });

    try {
      await Promise.all([user.save(), website.save()])
    } catch (err) {
      console.log(`Error in saving data to db in addWebsite`)
      console.log(err)
    }
    await enqueue("priority_high_domain", domain)

    return res.status(201).json({
      ...res,
      msg: `Website added sucessfully`,
      website: website
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;