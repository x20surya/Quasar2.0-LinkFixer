import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  websites: [
    {
      id : {
        type: String,
      },
      startURL: {
        type: String,
      },
    }
  ],
});

const WebsiteSchema = new mongoose.Schema({
  startURL: {
    type: String,
    required: true,
  },
  checkedAt: {
    type: Date,
    default: Date.now,
  },
  brokenLinks: {
    type: Array,
    default: [
      {
        url: String,
        status: Number,
        statusText: String,
      },
    ],
  },
  checkedLinks: {
    type: Array,
    default: [
      {
        url: String,
        status: Number,
        statusText: String,
      },
    ],
  },
  userID : {
    type: String,
  },
  estimatedTime : {
    type : Number,
    default : 0
  }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, emailVerified: this.emailVerified },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateVerificationToken = function () {
  const verificationToken = jwt.sign(
    { id: this._id },
    process.env.EMAIL_SECRET,
    { expiresIn: "24h" }
  );

  this.verificationToken = verificationToken;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};



export const User = mongoose.model("User", UserSchema);
export const Website = mongoose.model("Website", WebsiteSchema);
