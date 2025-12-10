import {Router} from 'express'
import { auth } from "../../middleware/auth.js";
import { User, Website } from '../../models/user.js';

const router = Router()

router.get('/', auth, async (req, res) => {
    const userId = req.user.id
    const user = await User.findById(userId).populate("websites")
    console.log(user)
    if(!user || !user.websites){
        return res.status(500).json({
            error : "Internal Server Error"
        })
    }

    return res.status(200).json({
        website : user.websites.map(({domain, updatedAt, id}) => {
            return {
                domain,
                updatedAt,
                id
            }
        }),
        user : userId,
        success : true
    })
})

export default router