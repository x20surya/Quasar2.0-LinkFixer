import express from "express";
import cors from "cors";
import { connectDB } from "./src/database/connectdb.js";
import authRoutes from "./src/routes/auth.js";
import apiRoutes from "./src/routes/website/index.js";
import cookieParser from "cookie-parser"
import userRoutes from "./src/routes/user/index.js"

export const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,                 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/user", userRoutes)

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  connectDB();
  if(process.env.MODE_NODE === "dev") console.log(`Server running on http://localhost:${PORT}`);
  else console.log(`Server running on port ${PORT}`);
});
