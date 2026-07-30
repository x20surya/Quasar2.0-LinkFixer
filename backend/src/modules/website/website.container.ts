import { WebsiteController } from "./website.controller.js"
import { WebsiteRepository } from "./website.repository.js"
import { WebsiteService } from "./website.service.js"

const websiteRepository = new WebsiteRepository()
const websiteService = new WebsiteService(websiteRepository)
const websiteController = new WebsiteController(websiteService)

export { websiteRepository, websiteService, websiteController }
