import amqp from "amqplib"
import dotenv from "dotenv"
import { Redis } from '@upstash/redis'
import ampq from "amqplib/callback_api"

dotenv.config()

const queue = process.env.QUEUE || "priority_low"
const instances = process.env.INSTANCES || 1 

const reddisURL = process.env.REDDIS_URL
const reddisToken = process.env.REDDIS_TOKEN
const rabbitMQURL = process.env.RABBITMQ_URL

const redis = new Redis({
    url: reddisURL,
    token: reddisToken,
})

ampq.connect(rabbitMQURL, (error0, connection) => {
    if (error0) {
        console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \n error0 trigerred")
        console.error(error0)
    }
    connection.createChannel((error1, channel) => {
        if (error1) {
            console.error("Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \n error1 trigerred")
            console.error(error1)
        }
        const queue = queue_name
        const msg = data
        try {
            channel.assertQueue(queue, {
                durable: true
            })
            
        } catch (err) {
            console.error("Error while enqueuing ::\nDestination : utils/scheduler/enqueue")
            console.error(err)
        }

    })
})