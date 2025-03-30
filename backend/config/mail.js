import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIl_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, verificationToken) => {
    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  };
  

  export  const sendReport = async (data) => {
    const {url, brokenLinks, email, checkedLinks, aiReport} = data
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Status report for ' + url,
      html: `
        <h1>Broken Links</h1>
        ${brokenLinks.length > 0 ? brokenLinks.map(link => `<p>${link.link}</p>`).join('') : '<p>No broken links found.</p>'}
        <h2>Analysis by AI</h2>
        <h3>${aiReport}</h3>
        <h1>Checked Links</h1>
        ${checkedLinks.length > 0 ? checkedLinks.map(link => `<p>${link.link}</p>`).join('') : '<p>No checked links found.</p>'}
        <h1>URL</h1>
        <p>${url}</p>
        <h1>Checked At</h1>
        <p>${new Date().toLocaleString()}</p>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Status email sent to ${email}`);
    } catch (error) {
      console.error('Error sending status email:', error);
      throw new Error('Failed to send status email');
    }
  }