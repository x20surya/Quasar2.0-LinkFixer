import { auth } from "../../middleware/auth.js";
import { User, Website } from "../../models/user.js";
import { Router } from "express";

const router = Router();

router.post("/", auth, async (req, res) => {
  const { websiteID } = req.body;
  if(!websiteID){
    return res.json({
      error : `Invalid request`
    })
  }
  const userID = req.user.id;
  if(!userID){
    return res.json({
      error : `Invalid request`
    })
  }
  try {
    const user = await User.findById(userID)
    if (user === null) {
      return res.status(404).json({ msg: `User not found` })
    }
    user.websites = user.websites.filter((web) => { return (web.id !== websiteID) })

    const website = await Website.findById(websiteID)
    if (website === null) {
      try {
        await user.save()
      } catch (err) {
        return res.json({
          error: `Error in saving data`
        })
      }
      return res.status(404).json(`Invalid website key`)
    }
    website.userID = website.userID.filter((user) => { return user !== userID })
    try {
      await Promise.all([website.save(), user.save()])
    } catch (err) {
      return res.json({
        error: `Error in saving data`
      })
    }
    return res.status(200).json({
      msg: `Deleted successfully`
    })
  } catch (err) {
    return res.status(500).json(`Server Error`)
  }
});

export default router;