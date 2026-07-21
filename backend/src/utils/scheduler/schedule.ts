import cron from "node-cron"

// Legacy scheduler hook kept as a no-op until a queue executor is wired in.
const executeQueue = () => undefined

cron.schedule("0 0 * * */1", () => {
  executeQueue()
})