import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { connectDB } from "./database/connectdb.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/message", (req, res) => {
  res.send({ message: "Hello" });
});

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
