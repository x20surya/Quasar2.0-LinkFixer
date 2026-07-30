import {Redis} from "ioredis"
import { config } from "../config/index.js"

export async function connectRedis() {
    const redis = new Redis(config.Redis_URL, {enableReadyCheck : false})
    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        console.log("Connected to Redis")
        cleanup()
        resolve()
      }

      const onError = (error: Error) => {
        console.log("Error in connection to Redis")
        console.error(error.message)
        cleanup()
        reject(error)
      }

      const cleanup = () => {
        redis.off("connect", onConnect)
        redis.off("error", onError)
      }

      redis.once("connect", onConnect)
      redis.once("error", onError)
    }).catch(() => {
      process.exit(1)
    })

    try {
      await redis.config("SET", "maxmemory-policy", "allkeys-lfu")
      console.log("maxmemory-policy set to allkeys-lfu")
    } catch (error) {
      console.error("Failed to set maxmemory-policy:", (error as Error).message)
    }

    return redis
  }