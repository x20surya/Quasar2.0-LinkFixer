import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.js"
import services from "../../middleware/services.js"
import { validate } from "../../middleware/validate.js"
import { websiteController } from "./website.container.js"

const router = Router()

// Serves the protected website route.
router.get("/protected", authMiddleware, websiteController.getProtected)

// Verifies a website ownership token.
router.post("/verifyWebsite", authMiddleware, websiteController.verifyWebsite)

// Adds a website to the current user.
router.post("/addWebsite", authMiddleware, websiteController.addWebsite)

// Removes a website from the current user.
router.post("/removeWebsite", authMiddleware, websiteController.removeWebsite)

// Queues a scan for a website.
router.post("/scanWebsite", authMiddleware, services, websiteController.scanWebsite)

// Development-only test route.
router.post("/test-aakri-1234", websiteController.testWebsite)

export default router
