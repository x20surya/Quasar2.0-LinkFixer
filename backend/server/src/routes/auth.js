import express from "express";
import { User } from "../models/user.js";
import { sendVerificationEmail } from "../utils/mail/mail.js";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// works
router.post("/register", async (req, res) => {
  let { username, email, password } = req.body;


  // preliminary validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please enter all fields" });
  }
  if (typeof (username) !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (typeof (email) !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (typeof (password) !== "string") {
    return res.status(400).json({ error: "Invalid password" });
  }

  // pre-processing
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  username = username.trim();
  email = email.trim().toLowerCase();
  password = password.trim();

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

    await Promise.all([user.save(), sendVerificationEmail(email, verificationToken)]);

    // add queue and error handler later

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
    res.status(401).json({ error: err.message });
  }
});

router.get("/verifyAuth", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    console.log("Verify Hit")
    if (!user) {
      return res.status(404).json({ 
        authenticated: false, 
        error: "User not found" 
      });
    }

    console.log(user)

    return res.json({
      authenticated: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ 
      authenticated: false, 
      error: "Server error" 
    });
  }
});

// routes/auth.js
router.post("/logout", (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    
    return res.json({ 
      success: true, 
      msg: "Logged out successfully" 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// works
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("Hit Login")
    console.log(email)
    console.log(user)
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong Email or Password" });
    }
    const token = user.generateAuthToken();

    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        error: "Login unsuccessful. Please verify your email.",
      });
    } else {
      console.log("RES.JSON")
      res.cookie('token', token, {
        httpOnly : true,
        sameSite : 'strict',
        maxAge : 7*24*60*60*1000
      })
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
        },
        msg: "Login successful.",
      });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// works
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Invalid Link" });
  }

  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // switch to redis logic / otp logic later
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
    // TODO add redirect to frontend page later
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
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const verificationToken = user.generateVerificationToken();
    await user.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ msg: "Verification email resent" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
