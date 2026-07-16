import { UserController } from "./user.controller.js"
import { UserRepository } from "./user.repository.js"
import { UserService } from "./user.service.js"

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
const userController = new UserController(userService)

export { userRepository, userService, userController }
