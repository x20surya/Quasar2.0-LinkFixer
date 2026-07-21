import jwt from "jsonwebtoken"
import { env } from "../../config/env.js"
import { sendVerificationEmail } from "../../utils/mail/mail.js"
import type { AuthRepository } from "./auth.repository.js"

type AuthUserPayload = {
    id: string
    username: string
    email: string
    emailVerified: boolean
}

type RegisterInput = {
    username: string
    email: string
    password: string
}

type LoginInput = {
    email: string
    password: string
}

type ResendVerificationInput = {
    email: string
}

type VerifyEmailInput = {
    token: string
}

export class AuthError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message)
        this.name = "AuthError"
    }
}

export class AuthService {
    constructor(private readonly repo: AuthRepository) {}

    // Registers a new user and sends the verification email.
    async register(input: RegisterInput) {
        const email = input.email.trim().toLowerCase()
        const username = input.username.trim()
        const password = input.password.trim()

        const existingUser = await this.repo.findUserByEmail(email)
        if (existingUser) {
            throw new AuthError("User already exists", 400)
        }

        const user = this.repo.createUser({ username, email, password }) as any
        const verificationToken = user.generateVerificationToken()

        await Promise.all([
            this.repo.saveUser(user),
            sendVerificationEmail(email, verificationToken),
        ])

        const token = user.generateAuthToken()

        return {
            token,
            user: this.formatUser(user),
            msg: "Registration successful. Please check your email to verify your account.",
        }
    }

    // Returns the authenticated user's profile state.
    async verifyAuth(userId: string) {
        const user = (await this.repo.findUserByIdWithoutPassword(userId)) as any

        if (!user) {
            throw new AuthError("User not found", 404)
        }

        return {
            authenticated: true,
            user: this.formatUser(user),
        }
    }

    // Clears the auth cookie response payload.
    logout() {
        return {
            success: true,
            msg: "Logged out successfully",
        }
    }

    // Validates credentials and returns the login token.
    async login(input: LoginInput) {
        const email = input.email.trim().toLowerCase()
        const password = input.password

        const user = (await this.repo.findUserByEmail(email)) as any
        if (!user) {
            throw new AuthError("Invalid credentials", 400)
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            throw new AuthError("Wrong Email or Password", 400)
        }

        if (!user.emailVerified) {
            throw new AuthError("Login unsuccessful. Please verify your email.", 401)
        }

        const token = user.generateAuthToken()

        return {
            token,
            success: true,
            user: this.formatUser(user),
            msg: "Login successful.",
        }
    }

    // Verifies the email token and marks the user as verified.
    async verifyEmail(input: VerifyEmailInput) {
        if (!input.token) {
            throw new AuthError("Invalid Link", 400)
        }

        const decoded = jwt.verify(input.token, env.EMAIL_SECRET) as { id?: string }
        if (!decoded.id) {
            throw new AuthError("Invalid Link", 400)
        }

        const user = (await this.repo.findUserById(decoded.id)) as any
        if (!user) {
            throw new AuthError("User not found", 404)
        }

        if (
            user.verificationToken !== input.token ||
            !user.verificationTokenExpires ||
            new Date(user.verificationTokenExpires).getTime() < Date.now()
        ) {
            throw new AuthError("Verification token is invalid or has expired", 400)
        }

        user.emailVerified = true
        user.verificationToken = null
        user.verificationTokenExpires = null
        await this.repo.saveUser(user)

        return {
            authToken: user.generateAuthToken(),
        }
    }

    // Resends the verification email for an unverified user.
    async resendVerification(input: ResendVerificationInput) {
        const email = input.email.trim().toLowerCase()
        const user = (await this.repo.findUserByEmail(email)) as any

        if (!user) {
            throw new AuthError("User not found", 404)
        }

        if (user.emailVerified) {
            throw new AuthError("Email already verified", 400)
        }

        const verificationToken = user.generateVerificationToken()
        await this.repo.saveUser(user)
        await sendVerificationEmail(email, verificationToken)

        return {
            msg: "Verification email resent",
        }
    }

    // Returns the current user without the password field.
    async getUser(userId: string) {
        const user = (await this.repo.findUserByIdWithoutPassword(userId)) as any

        if (!user) {
            throw new AuthError("User not found", 404)
        }

        return user
    }

    private formatUser(user: { _id: unknown; username: string; email: string; emailVerified: boolean }) {
        return {
            id: String(user._id),
            username: user.username,
            email: user.email,
            emailVerified: user.emailVerified,
        } satisfies AuthUserPayload
    }
}