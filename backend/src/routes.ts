import type { Express } from "express"
import authRoutes from "./modules/auth/auth.routes.js"
import websiteRoutes from "./modules/website/website.routes.js"
import userRoutes from "./modules/user/user.routes.js"

export const registerRoutes = (app: Express) => {

  app.get("/health", (req, res) => {
    res.status(200).send("OK")
  })

  app.use("/api/auth", authRoutes)
  app.use("/api/website", websiteRoutes)
  app.use("/api/user", userRoutes)
}
