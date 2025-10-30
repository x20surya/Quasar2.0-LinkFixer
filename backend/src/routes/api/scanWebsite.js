import { Router } from "express";
import enqueue from "../../utils/scheduler/enqueue.js";

const router = Router()

router.post("/", (req, res) => {

    console.log("Hit")
    
    // check rate limit
    // check if already enqueued

    enqueue("WorkExamplesNNNNNN", "Hello world")

    return res.json({
        msg: "/scanWebsites responding"
    }).status(200)
})


export default router