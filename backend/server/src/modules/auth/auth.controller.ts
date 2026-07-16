import type { Request, Response } from "express"
import { AuthError, type AuthService } from "./auth.service.js"

type AuthenticatedRequest = Request & {
    user?: {
        id: string
    }
}

export class AuthController {
    constructor(private readonly service: AuthService) {}

    // Handles user registration.
    async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body as {
                username: string
                email: string
                password: string
            }

            const result = await this.service.register({ username, email, password })
            return res.json(result)
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Handles the auth verification check.
    async verifyAuth(req: AuthenticatedRequest, res: Response) {
        try {
            const result = await this.service.verifyAuth(req.user?.id ?? "")
            return res.json(result)
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Clears the auth cookie.
    async logout(_req: Request, res: Response) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })

            return res.json(this.service.logout())
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Handles login and sets the auth cookie.
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body as { email: string; password: string }
            const result = await this.service.login({ email, password })

            res.cookie("token", result.token, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })

            return res.status(200).json({
                success: result.success,
                user: result.user,
                msg: result.msg,
            })
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Verifies the email token and returns the success page.
    async verifyEmail(req: Request, res: Response) {
        try {
            const token = typeof req.query.token === "string" ? req.query.token : ""
            await this.service.verifyEmail({ token })

            return res.send(`
                <html>
                    <body>
                        <h1>Email Verified Successfully!</h1>
                        <p>You can now log in to your account.</p>
                    </body>
                </html>
            `)
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Resends the verification email.
    async resendVerification(req: Request, res: Response) {
        try {
            const { email } = req.body as { email: string }
            const result = await this.service.resendVerification({ email })
            return res.status(200).json(result)
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    // Returns the current user.
    async getUser(req: AuthenticatedRequest, res: Response) {
        try {
            const user = await this.service.getUser(req.user?.id ?? "")
            return res.json(user)
        } catch (err) {
            return this.handleError(err, res)
        }
    }

    private handleError(err: unknown, res: Response) {
        if (err instanceof AuthError) {
            return res.status(err.statusCode).json({ error: err.message })
        }

        const message = err instanceof Error ? err.message : "Server error"
        return res.status(500).json({ error: message })
    }
}