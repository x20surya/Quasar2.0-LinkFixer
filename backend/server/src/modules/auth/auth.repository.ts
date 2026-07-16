import { User } from "../../models/user.js"

export class AuthRepository {
	// Creates a user document instance.
	createUser(data: { username: string; email: string; password: string }) {
		return new User(data)
	}

	// Finds a user by email.
	findUserByEmail(email: string) {
		return User.findOne({ email })
	}

	// Finds a user by id.
	findUserById(userId: string) {
		return User.findById(userId)
	}

	// Finds a user by id without the password field.
	findUserByIdWithoutPassword(userId: string) {
		return User.findById(userId).select("-password")
	}

	// Persists a user document.
	saveUser(user: InstanceType<typeof User>) {
		return user.save()
	}
}