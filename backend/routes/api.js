import express from "express";

const router = express.Router();

import { auth } from "../middleware/auth.js";

router.get("/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

export default router;
