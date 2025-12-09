import { Router } from "express";
import enqueue from "../../utils/scheduler/enqueue.js";
import { User, Website } from "../../models/user.js";
import { auth } from "../../middleware/auth.js";
import Redis from "ioredis"
import services from "../../middleware/services.js"
const router = Router()

router.post("/", auth, services, async (req, res) => {

    const { websiteID, force } = req.body
    const userID = req.user.id;

    const user = await User.findById(userID)
    if (!user.websites.some((website) => { return websiteID == website.toString() })) {
        // this should not be possible
        return res.status(404).json({
            error: `Website not found 1`
        })
    }
    
    const website = await Website.findById(websiteID)
    if (website === null) {
        console.log(user.websites)
        console.log(websiteID)
        return res.status(404).json({
            error: `Website not found 2`
        })
    }

    if (!force && website.checks.length > 0) {
        let finalCheck = website.checks[0]

        for (const check of website.checks) {
            if (Number(check.checkedAt) > Number(finalCheck.checkedAt)) {
                finalCheck = check
            }
        }
        if (Number(Date.now()) - Number(finalCheck.checkedAt) > 3 * 60 * 60 * 1000) {
            return res.json({
                msg: `Recent Results`,
                data: finalCheck
            })
        }
    }
    const domain = website.domain
    const redis = new Redis(process.env.REDIS_URL)
    const queuedKey = `queued:${domain}`

    console.log(queuedKey)

    const isQueued = await redis.get(queuedKey)
    if (isQueued === 1 || isQueued === "1") {
        return res.status(200).json({ msg: `website already in queue` })
    }
    const temp = await redis.set(queuedKey, 1)

    
    const queueLength = await enqueue("priority_high_domain", JSON.stringify({
        id: websiteID,
        attempt: 0
    }))
    if (queueLength !== -1) {
        return res.json({
            msg: "/scanWebsites responding",
            size: queueLength,
            success: true

        }).status(200)
    } else {
        return res.json({
            error: `Error in queuing`,
            success: false
        }).status(500)
    }
})


router.post("/test-aakri-1234", async (req, res) => {
    if (process.env.MODE_NODE !== "dev") {
        return res.status(123).json({ you: `naughty` })
    }
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