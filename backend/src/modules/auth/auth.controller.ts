import type { Request, Response } from "express"
import { AuthError, type AuthService } from "./auth.service.js"
import { asyncHandler } from "../../utils/asyncHandler.js"

type AuthenticatedRequest = Request & {
    user?: {
        id: string
    }
}

export class AuthController {
    constructor(private readonly service: AuthService) {}

    // Handles user registration.
    register = asyncHandler(async (req: Request, res: Response) => {
            const { username, email, password } = req.body as {
                username: string
                email: string
                password: string
            }

            const result = await this.service.register({ username, email, password })
            return res.json(result)
    })

    // Handles the auth verification check.
    verifyAuth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const result = await this.service.verifyAuth(req.user?.id ?? "")
        return res.json(result)
    })

    // Clears the auth cookie.
    logout = asyncHandler(async (_req: Request, res: Response) => {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        return res.json(this.service.logout())
    })

    // Handles login and sets the auth cookie.
    login = asyncHandler(async (req: Request, res: Response) => {
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
    })

    // Verifies the email token and returns the success page.
    verifyEmail = asyncHandler(async (req: Request, res: Response) => {
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
    })

    // Resends the verification email.
    resendVerification = asyncHandler(async (req: Request, res: Response) => {
        const { email } = req.body as { email: string }
        const result = await this.service.resendVerification({ email })
        return res.status(200).json(result)
    })

    // Returns the current user.
    getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = await this.service.getUser(req.user?.id ?? "")
        return res.json(user)
    })

    private handleError(err: unknown, res: Response) {
        if (err instanceof AuthError) {
            return res.status(err.statusCode).json({ error: err.message })
        }

        const message = err instanceof Error ? err.message : "Server error"
        return res.status(500).json({ error: message })
    }
}