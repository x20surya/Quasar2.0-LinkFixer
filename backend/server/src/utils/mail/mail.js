export const sendVerificationEmail = async (email, verificationToken) => {

  const apiKey = process.env.BREVO_KEY;
  if (!apiKey) {
    throw new Error('Brevo API key is not defined in environment variables');
  }

  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

  const htmlTemplate = `<html>
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    </html>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
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
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};


export const sendReport = async (data) => {

  const apiKey = process.env.BREVO_KEY;
  if (!apiKey) {
    throw new Error('Brevo API key is not defined in environment variables');
  }

  const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

  const htmlTemplate = `<html>
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    </html>`;

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
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
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}