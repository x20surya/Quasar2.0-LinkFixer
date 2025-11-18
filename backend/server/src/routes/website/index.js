import express from "express";
import { auth } from "../middleware/auth.js";
import addWebsite from "addWebsite.js";
import removeWebsite from "deleteWebsite.js";
import scanWebsite from "scanWebsite.js"


const router = express.Router();

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

router.use("/addWebsite", addWebsite);
router.use("/removeWebsite", removeWebsite);
router.use("/scanWebsite", scanWebsite);

export default router