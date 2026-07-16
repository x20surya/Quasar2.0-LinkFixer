import type { Express } from "express"
import authRoutes from "./routes/auth.js"
import apiRoutes from "./routes/website/index.js"
import userRoutes from "./routes/user/index.js"

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes)
  app.use("/api", apiRoutes)
  app.use("/api/user", userRoutes)
}
