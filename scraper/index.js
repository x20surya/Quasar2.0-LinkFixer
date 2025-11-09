import express from "express"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { isInstanceRunning, setQueueName } from "./scraper"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors({}))

app.get("/health", (res, res) => {
    return res.json({ msg: "OK" }).status(200)
})

const jwtVerification = async (req, res, next) => {
    const { authorization } = req.headers
    const key = process.env.JWT_SECRET
    try {
        jwt.verify(authorization, key)
    } catch (err) {
        return res.json({
            error: "Unauthorized request"
        }).status(400)
    }
    next()
}

app.post("/setQueue", jwtVerification, async (req, res) => {
    const { id, queue, limit } = req.body
    if (!queue || !id) {
        return res.json({ error: "Invalid Request" }).status(400)
    }
    if (typeof (queue) !== "string" || typeof (id) !== "string") {
        return res.json({ error: "Invalid Request" }).status(400)
    }
    if (!setQueueName(queue)) {
        // log changes
        return res.json({ error: "Machine not available" }).status(500)
    }
    return res.json({ msg: "Machine Started" }).status(200)
})

// globsl generic error handler
app.use((err, req, res, next) => {
    if (err) {
        console.log(err)
        return res.json({
            error: "Unexpected Server Error"
        }).status(500)
    }
})