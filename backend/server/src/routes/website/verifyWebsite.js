import { Router } from "express"
import { auth } from "../../middleware/auth"
import { User, Website } from "../../models/user"
import verifyWebsite from "../../utils/website/verification"

const router = Router()

router.post(`/`, auth, async (req, res) => {
    const userID = req.user.id

    const user = await User.findById(userID)

    if (user === null) {
        return res.status(403).json({
            error: `Unauthorized`
        })
    }

    const { link, replace } = req.body

    const data = await verifyWebsite(link, userID, replace)

    if (data.success) {
        return res.status(200).json({
            success: true,
            msg: `New Owner assigned`
        })
    } else {
        return res.status(400).json(data)
    }
})

export default router