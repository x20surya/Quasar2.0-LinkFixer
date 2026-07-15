import { Redis } from "ioredis"
import { config } from "../config/index.js"
import * as amqp from "amqplib"
import getRedisChannel from "../utils/getRedisChannel.js"

export class Constants {
  static subscriber: Redis
  static redis: Redis

  static connection: amqp.ChannelModel
  static channel: amqp.Channel
  static pushBrowser: amqp.Channel

  static interval: NodeJS.Timeout | null
  static scraperStatus: number

  static isActive : boolean 

  private constructor(
    connection: amqp.ChannelModel,
    channel: amqp.Channel,
    pushBrowser: amqp.Channel,
  ) {
    Constants.subscriber = new Redis(config.Redis_URL)
    Constants.redis = new Redis(config.Redis_URL)
    Constants.connection = connection
    Constants.channel = channel
    Constants.pushBrowser = pushBrowser
    Constants.interval = null
    Constants.scraperStatus = 0
    Constants.isActive = false
  }

  static async init() {
    const connection = await amqp.connect(config.RabbitMQ_URL)
    const channel = await this.connection.createChannel()
    const pushBrowser = await this.connection.createChannel()
    return new Constants(connection, channel, pushBrowser)
  }

  static async setup() {
    Constants.isActive = true
    await Constants.pushBrowser.assertQueue("available_browsers")
    await Constants.pushBrowser.sendToQueue(
      "available_browsers",
      Buffer.from(JSON.stringify({ id: config.ID })),
    )
    console.log(`[${config.ID}] :: Browser pushed to queue`)

    Constants.redis.on("connect", () =>
      console.log(`[${config.ID}] :: Client Connected to Railway Redis ✅`),
    )
    Constants.redis.on("error", (err) =>
      console.error(`[${config.ID}] :: Client Redis error:`, err),
    )

    Constants.subscriber.on("connect", () =>
      console.log(`[${config.ID}] :: Subscriber Connected to Railway Redis ✅`),
    )
    Constants.subscriber.on("error", (err) =>
      console.error(`[${config.ID}] :: Subscriber Redis error:`, err),
    )
    this.setupScraperStatusPublisher()
    await Constants.subscriber.subscribe(getRedisChannel())
  }

  private static setupScraperStatusPublisher() {
    Constants.interval = setInterval(async () => {
      console.log(
        `[${config.ID}] :: Sending scraperStatus = `,
        Constants.scraperStatus,
      )
      await Constants.redis.publish(
        `${config.ID}_scraperStatus`,
        Constants.scraperStatus.toString(),
      )
      if (Constants.scraperStatus == -1) {
        Constants.scraperStatus = 0
      }
    }, 7000)
  }

  static stopScraperStatusPublisher() {
    if (Constants.interval) clearInterval(Constants.interval)
  }
}
