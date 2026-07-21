import type { UserRepository } from "./user.repository.js"

type WebsiteSummary = {
	domain: string
	updatedAt: Date
	id: string
}

type PopulatedWebsite = {
	domain: string
	updatedAt: Date
	id: string
}

export class UserService {
	constructor(private readonly repo: UserRepository) {}

	// Converts the database user record into the response payload.
	async getWebsites(userId: string) {
		const user = await this.repo.findWebsitesByUserId(userId)

		if (!user || !user.websites) {
			return null
		}

		const websites = (user.websites as unknown as PopulatedWebsite[]).map(({ domain, updatedAt, id }) => ({
			domain,
			updatedAt,
			id,
		}))

		return {
			website: websites,
			user: userId,
			success: true,
		}
	}
}
