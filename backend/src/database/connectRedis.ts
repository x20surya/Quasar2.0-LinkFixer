import {Redis} from "ioredis"
import { env } from "../config/env.js"

export async function connectRedis() {
    const redis = new Redis(env.REDIS_URL)
    await new Promise<void>((resolve, reject) => {
      const onConnect = () => {
        console.log("Connected to Redis ✅")
        cleanup()
        resolve()
      }

      const onError = (error: Error) => {
        console.log("Error in connection to Redis ❌")
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
    return redis
  }