import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDB } from "./database/connectdb.js"
import { registerRoutes } from "./routes.js"

export const createServer = async () => {
  await connectDB()
  const app = express()

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
    }),
  )
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  registerRoutes(app)

  app.get("/health", (req, res) => {
    res.status(200).send("OK")
  })

  return app
}
