import amqp from "amqplib"
import { env } from "../../config/env.js"

const rabbitURL = env.RABBITMQ_URL
if (!rabbitURL) {
  console.error(
    "Fatal ERROR ::\nDestination : utils/scheduler/enqueue :: \nRABBITMQ_URL missing",
  )
  process.exit(1)
}

let channel: any
let connection: any
let connectTimeout: ReturnType<typeof setTimeout> | undefined

async function connect() {
  try {
    connection = await amqp.connect(rabbitURL)
    channel = await connection.createChannel()
    if (connectTimeout) {
      clearTimeout(connectTimeout)
    }
    console.log("Connected to RabbitMQ")
  } catch {
    console.log(`Error in connecting to rabbitMQ`)
    connectTimeout = setTimeout(connect, 5000)
  }
}

void connect()

// Enqueues a message onto a RabbitMQ queue.
export default async function enqueue(queueName: string, data: string) {
  try {
    await channel.assertQueue(queueName, {
      durable: true,
    })
    await channel.sendToQueue(queueName, Buffer.from(data), {
      persistent: true,
    })
    const ret = await channel.checkQueue(queueName)
    console.log(`${data} pushed to ${queueName}`)
    return ret.messageCount
  } catch (error) {
    console.error("Error while enqueuing ::\nDestination : utils/scheduler/enqueue")
    console.error(error)
    return -1
  }
}