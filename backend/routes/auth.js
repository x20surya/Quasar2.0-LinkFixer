import express from "express";

const router = express.Router();

import { User } from "../models/user.js";

import { sendVerificationEmail } from "../config/mail.js";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";

import dotenv from "dotenv";
dotenv.config();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      username,
      email,
      password,
    });

    const verificationToken = user.generateVerificationToken();

    await user.save();

    await sendVerificationEmail(email, verificationToken);

    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      msg: "Registration successful. Please check your email to verify your account.",
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = user.generateAuthToken();

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      msg: user.emailVerified
        ? "Login successful"
        : "Login successful. Please verify your email.",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ msg: "No verification token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (
      user.verificationToken !== token ||
      user.verificationTokenExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ msg: "Verification token is invalid or has expired" });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    const authToken = user.generateAuthToken();

    // res.json({
    //   token: authToken,
    //   msg: "Email verified successfully",
    // });
    return res.send(`
        <html>
          <body>
            <h1>Email Verified Successfully!</h1>
            <p>You can now log in to your account.</p>
          </body>
        </html>
      `);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ msg: "Email already verified" });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.json({ msg: "Verification email resent" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;
