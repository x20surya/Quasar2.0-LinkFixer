import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/database/connectdb.js";
import authRoutes from "./src/routes/auth.js";
import apiRoutes from "./src/routes/api.js";
import { startupSeq } from "./src/utils/scheduler/logger.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  connectDB();
  if(process.env.MODE_NODE === "dev") console.log(`Server running on http://localhost:${PORT}`);
  else console.log(`Server running on port ${PORT}`);
});
