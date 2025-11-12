import dotenv from 'dotenv'
import { Redis } from '@upstash/redis'

dotenv.config()

const Redis_URL = process.env.REDIS_URL
const Redis_Token = process.env.REDIS_TOKEN

const redis = new Redis({
    url: Redis_URL,
    token: Redis_Token
})

const IDs = ["scraper-2", "scraper-1"]

await redis.set("MESSAGE_FROM_DEMO_MANAGER", 1, {ex : 6000})

for (const id of IDs) {
    const key = `${id}_domain`
    console.log("Pushing to ", key)
    await redis.publish(key, JSON.stringify({
        domain: "https://iiitranchi.ac.in", linkQueue: "https://iiitranchi.ac.in_links", maxPages : 3
    }))
}