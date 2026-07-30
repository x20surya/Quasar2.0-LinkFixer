import { config } from "./config/index.js"
import { Scraper } from "./init/Scraper.js"

if (!config.ID || !config.RabbitMQ_URL || !config.Redis_URL) {
  throw new Error("Missing required environment variables")
}

const scraper = await Scraper.init()
await scraper.setup()

