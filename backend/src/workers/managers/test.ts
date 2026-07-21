import { env } from "../../config/env.js";
import * as amqp from "amqplib"
import { websiteService } from "../../modules/website/website.container.js";

async function testManager (url : string) {
    const connection = await amqp.connect(env.RABBITMQ_URL)
    const channel = await connection.createChannel()

    await channel.assertQueue(env.QUEUE, { durable: true })
    await websiteService.testWebsite("https://iiitranchi.ac.in")
}