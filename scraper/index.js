import express from "express"
import dotenv from "dotenv"

dotenv.config()
const app = express()

app.use(express.json())
app.use(cors({}))

app.get("/health", (res, res) => {
    return res.json({ msg: "OK" }).status(200)
})

app.post("/setQueue", (req, res) => {
    const {id, queue, limit} = req.body
    

})