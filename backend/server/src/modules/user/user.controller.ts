import type { Request, Response } from "express"
import type { UserService } from "./user.service.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

type AuthenticatedRequest = Request & {
	user?: {
		id: string
	}
}

export class UserController {
	constructor(private readonly service: UserService) {}

	// Handles the websites lookup request for the current user.
	getWebsites = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
		const userId = req.user?.id

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const payload = await this.service.getWebsites(userId)

		if (!payload) {
			return res.status(500).json({
				error: "Internal Server Error",
			})
		}

		return res.status(200).json(payload)
	})
}
