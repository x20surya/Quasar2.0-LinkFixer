import { Redis } from "ioredis"
import type { middlewareFn } from "./middleware.types.js"

const redisUrl = process.env.REDIS_URL
const redis = redisUrl ? new Redis(redisUrl) : null

// Blocks requests when shared backend services are marked down.
const servicesOnline: middlewareFn = async (req, res, next) => {
  if (!redis) {
    return res.status(503).json({
      error: "All services are currently down",
    })
  }

  const data = await redis.get("SERVICES:DOWN")
  if (data !== null || data === 1 || data === "1") {
    return res.status(503).json({
      error: "All services are currently down",
    })
  }

  return next()
}

export default servicesOnline