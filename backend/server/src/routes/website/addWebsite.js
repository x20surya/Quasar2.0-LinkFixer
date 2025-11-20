import { auth } from "../../middleware/auth.js";
import { User, Website } from "../../models/user.js";
import { Router } from "express";
import { parseSitemap } from "../../utils/website/sitemap.js";
import enqueue from "../../utils/scheduler/enqueue.js";

const router = Router();
router.post("/", auth, async (req, res) => {
  let { link } = req.body;
  const user = await User.findById(req.user.id)
    .select("-password")
    .populate("websites");
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!link) {
    return res.status(400).json({ error: "Please provide a valid start URL" });
  }
  if (!link.includes("http")) {
    link = "http://" + link
  }
  let url
  try {
    url = new URL(link)
  } catch (err) {
    return res.status(403).json({ error: `Invalid URL` })
  }
  const domain = url.origin
  if (!domain) {
    return res.status(400).json({ error: "Please provide a valid start URL" });
  }

  const website = await Website.findOne({
    domain
  })

  if (website !== null) {

    if (user.websites.some((website) => website.domain === domain)) {
      return res.status(400).json({ error: "Website already added to user" });
    }
    user.websites.push({
      id: website._id,
      domain: website.domain
    })
    website.userID.push(user.id)

    try {
      await Promise.all([user.save(), website.save()])
    } catch (err) {
      return res.json({
        error: `Error in saving data`
      }).status(400)
    }
    return res.json({
      msg: `Website added sucessfully`,
      website: website
    }).status(200)
  }

  let reports = {}

  if (user.websites.some((website) => website.domain === domain)) {
    // console.log(`Invalid foreign key to website in User`)
    user.websites = user.websites.filter((website) => { website.domain !== domain })
  }

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
      userID: [req.user.id],
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
      return res.status(400).json({
        error: `Error in saving data`
      })
    }

    return res.status(201).json({
      ...reports,
      msg: `Website added sucessfully`,
      website: website
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error" });
  }
});

export default router;