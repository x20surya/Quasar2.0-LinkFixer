import Redis from `ioredis`

const redis = new Redis(process.env.REDIS_URL)

export async function servicesOnline(req, res, next) {
    const data = await redis.get(`SERVICES:DOWN`)
    if (data !== null || data === 1 || data === "1") {
        return res.json({
            error: "All services are currently down"
        }).status(503)
    }
    next()
}