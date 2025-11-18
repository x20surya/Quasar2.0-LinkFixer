import { Router } from "express";
import enqueue from "../../utils/scheduler/enqueue.js";
import { Website } from "../../models/user.js";
import Redis from "ioredis"
const router = Router()

router.post("/", async (req, res) => {

    const { domain } = req.body

    console.log("Hit")

    let website = await Website.findOne({
        domain: domain
    })
    if (!website) {
        website = new Website({
            domain: domain,
            sitemapLinks: [domain],
            checkedLinks: [],
            checkedAt: Date.now()
        })
        await website.save()
    }
    
    const redis = new Redis(process.env.REDIS_URL)
    await redis.set(`queued:${website.id}`, 1)
    
    enqueue("priority_high_domain", JSON.stringify({
        id: website.id,
        attempt: 0
    }))





    return res.json({
        msg: "/scanWebsites responding"
    }).status(200)
})


export default router