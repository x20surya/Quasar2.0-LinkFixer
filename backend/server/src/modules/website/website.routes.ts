import { Router } from "express"
import { authMiddleware } from "../../middleware/auth.js"
import services from "../../middleware/services.js"
import { validate } from "../../middleware/validate.js"
import { websiteController } from "./website.container.js"

const router = Router()

// Serves the protected website route.
router.get("/protected", authMiddleware, (req, res) => {
  return websiteController.getProtected(req, res)
})

// Verifies a website ownership token.
router.post("/verifyWebsite", authMiddleware, (req, res) => {
  void websiteController.verifyWebsite(req, res)
})

// Adds a website to the current user.
router.post("/addWebsite", authMiddleware, (req, res) => {
  void websiteController.addWebsite(req, res)
})

// Removes a website from the current user.
router.post("/removeWebsite", authMiddleware, (req, res) => {
  void websiteController.removeWebsite(req, res)
})

// Queues a scan for a website.
router.post("/scanWebsite", authMiddleware, services, (req, res) => {
  void websiteController.scanWebsite(req, res)
})

// Development-only test route.
router.post("/test-aakri-1234", (req, res) => {
  void websiteController.testWebsite(req, res)
})

export default router
