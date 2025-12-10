import {Router} from 'express'
import getWebsite from "./userWebsites.js"

const router = Router()

router.use("/websites", getWebsite)

export default router