interface Config {
  RabbitMQ_URL: string
  Redis_URL: string
  ID: string
}

export const config : Config= {
  RabbitMQ_URL: process.env.RABBITMQ_URL ?? "",
  Redis_URL: process.env.REDIS_PUBLIC_URL ?? "",
  ID: process.env.INSTANCE_ID ?? "",
}
