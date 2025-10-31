import { auth } from "../../middleware/auth.js";
import { User, Website } from "../../models/user.js";
import { addToQueue } from "../../utils/scheduler/logger.js";
import {Router} from "express";

const router = Router();
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

export default router;