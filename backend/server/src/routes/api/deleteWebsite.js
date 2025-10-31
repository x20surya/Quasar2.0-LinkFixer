import { auth } from "../../middleware/auth.js";
import { Website } from "../../models/user.js";
import {Router} from "express";

const router = Router();

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

export default router;