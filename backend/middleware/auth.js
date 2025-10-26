import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    if (!decoded.emailVerified) {
      return res
        .status(401)
        .json({ msg: "Email not verified, please verify your email" });
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
