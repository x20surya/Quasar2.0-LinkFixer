// Sends the verification email through Brevo.
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  const apiKey = process.env.BREVO_KEY
  if (!apiKey) {
    throw new Error("Brevo API key is not defined in environment variables")
  }

  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`

  const htmlTemplate = `<html>
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    </html>`

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "LinkFixer", email: "streamthread2206@gmail.com" },
        to: [{ email }],
        subject: "LinkFixer Signup Email verification",
        htmlContent: htmlTemplate,
      }),
    })
    console.log(`Verification email sent to ${email}`)
  } catch (error) {
    console.error("Error sending verification email:", error)
    throw new Error("Failed to send verification email")
  }
}

// Sends a report email payload.
export const sendReport = async (data: unknown) => {
  const apiKey = process.env.BREVO_KEY
  if (!apiKey) {
    throw new Error("Brevo API key is not defined in environment variables")
  }

  const reportEmail = process.env.REPORT_EMAIL ?? "streamthread2206@gmail.com"
  const htmlTemplate = `<html>
      <h1>LinkFixer Report</h1>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </html>`

  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "LinkFixer", email: "streamthread2206@gmail.com" },
        to: [{ email: reportEmail }],
        subject: "LinkFixer Report",
        htmlContent: htmlTemplate,
      }),
    })
    console.log(`Report email sent to ${reportEmail}`)
  } catch (error) {
    console.error("Error sending report:", error)
    throw new Error("Failed to send report")
  }
}