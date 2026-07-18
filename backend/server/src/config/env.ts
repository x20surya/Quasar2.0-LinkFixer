export const env = {
    PORT : process.env.PORT || 5000,
    MONGO_URI : process.env.MONGO_URI ?? "",
    JWT_SECRET : process.env.JWT_SECRET ?? "",
    EMAIL_SECRET : process.env.EMAIL_SECRET ?? "",
    RABBITMQ_URL : process.env.RABBITMQ_URL ?? ""
}