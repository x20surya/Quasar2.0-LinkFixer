import { Router } from "express";
import enqueue from "../../utils/scheduler/enqueue.js";

const router = Router()

router.post("/", (req, res) => {

    const { domain } = req.body

    console.log("Hit")

    enqueue("priority_low", domain)

    return res.json({
        msg: "/scanWebsites responding"
    }).status(200)
})


export default router