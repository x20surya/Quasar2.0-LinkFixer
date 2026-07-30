import { User } from "../../models/user.js";

export class UserRepository {
	// Loads the authenticated user's websites from the database.
	async findWebsitesByUserId(userId: string) {
		return User.findById(userId).populate("websites")
	}
}
