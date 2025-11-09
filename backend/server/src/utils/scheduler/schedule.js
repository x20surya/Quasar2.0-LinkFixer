import cron from "node-cron"
import { executeQueue } from "./logger"

cron.schedule("0 0 * * */1", () => {
    executeQueue()
})