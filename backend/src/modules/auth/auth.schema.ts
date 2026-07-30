import z from "zod"

const authBody = {
    username: z.string({ error: "Invalid username" }),
    email: z.string({ error: "Invalid email" }).email("Invalid email"),
    password: z.string({ error: "Invalid password" }).min(6, "Password must be at least 6 characters"),
}

export const authRegisterSchema = z.object({
    body: z.object({
        username: authBody.username,
        email: authBody.email,
        password: authBody.password,
    }),
})

export const authLoginSchema = z.object({
    body: z.object({
        email: authBody.email,
        password: z.string({ error: "Invalid password" }).min(1, "Invalid password"),
    }),
})

export const authResendVerificationSchema = z.object({
    body: z.object({
        email: authBody.email,
    }),
})

export const authVerifyEmailSchema = z.object({
    query: z.object({
        token: z.string({ error: "Invalid Link" }).min(1, "Invalid Link"),
    }),
})