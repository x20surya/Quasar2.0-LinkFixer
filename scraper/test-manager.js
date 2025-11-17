import amqp from "amqplib"
import { Redis } from "ioredis"


const Redis_URL = process.env.REDIS_PUBLIC_URL
const RabbitMQ_URL = process.env.RABBITMQ_URL

if (!Redis_URL || !RabbitMQ_URL) {
    console.log("ENV variables missing")
    process.exit(1)
}

const redis = new Redis(Redis_URL)

const IDs = ["scraper-2", "scraper-1"]
const domain = "https://iiitranchi.ac.in"
const queue = "https://iiitranchi.ac.in_links"
const links = [
    "https://iiitranchi.ac.in/",
    "https://iiitranchi.ac.in/default.aspx",
    "https://iiitranchi.ac.in/glance.aspx",
    "https://iiitranchi.ac.in/facilities.aspx",
    "https://iiitranchi.ac.in/fees.aspx",
    "https://iiitranchi.ac.in/faculty.aspx",
    "https://iiitranchi.ac.in/toppers.aspx",
    "https://iiitranchi.ac.in/gallery.aspx",
    "https://iiitranchi.ac.in/awards.aspx",
    "https://iiitranchi.ac.in/media.aspx",
    "https://iiitranchi.ac.in/alumni.aspx",
    "https://iiitranchi.ac.in/contact.aspx"
];


await redis.set("MESSAGE_FROM_DEMO_MANAGER", 1)
await redis.expire("MESSAGE_FROM_DEMO_MANAGER", 20)
await redis.del(`${domain}_checkedLinks`)
await redis.del(`${domain}_results`)

const connection = await amqp.connect(RabbitMQ_URL)
const channel = await connection.createChannel()

await channel.assertQueue(queue)
await channel.deleteQueue(queue)
await channel.assertQueue(queue)

for (const link of links) {
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify({
        link,
        depth: 0
    })))
}

for (const id of IDs) {
    const key = `${id}_domain`
    console.log("Pushing to ", key)
    await redis.publish(key, JSON.stringify({
        domain: domain, linkQueue: queue, maxPages: 4, limit : 100
    }))
}