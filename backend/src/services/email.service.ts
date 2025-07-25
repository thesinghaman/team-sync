import { Resend } from "resend";
import { config } from "../config/app.config";

const resend = new Resend(config.RESEND_API_KEY);

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
  userName: string,
  fromSignup: boolean = false
) => {
  // Include from=signup parameter if this is from signup flow
  const verificationUrl = fromSignup
    ? `${config.CLIENT_URL}/verify-email?token=${verificationToken}&from=signup`
    : `${config.CLIENT_URL}/verify-email?token=${verificationToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Team Sync <teamsync@singhaman.me>",
      to: [email],
      subject: "Verify Your Email Address - Team Sync",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              background-color: #f8fafc;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 8px;
            }
            h1 {
              color: #1e293b;
              margin: 0 0 16px 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 32px;
            }
            .verify-btn {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              text-align: center;
              margin: 24px 0;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            }
            .verify-btn:hover {
              background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            }
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
              text-align: center;
            }
            .highlight {
              background-color: #f1f5f9;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 16px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🚀 Team Sync</div>
              <h1>Welcome to Team Sync!</h1>
            </div>

            <div class="content">
              <p>Hi ${userName},</p>

              <p>Thank you for signing up for Team Sync! We're excited to have you on board.</p>

              <p>To get started with managing your projects and collaborating with your team, please verify your email address by clicking the button below:</p>

              <div style="text-align: center;">
                <a href="${verificationUrl}" class="verify-btn">Verify Email Address</a>
              </div>

              <div class="highlight">
                <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
              </div>

              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #3b82f6;">${verificationUrl}</p>

              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>✅ Create and manage workspaces</li>
                <li>✅ Organize projects with custom emojis</li>
                <li>✅ Track tasks with priorities and statuses</li>
                <li>✅ Invite team members and collaborate</li>
                <li>✅ View analytics and insights</li>
              </ul>
            </div>

            <div class="footer">
              <p>If you didn't create an account with Team Sync, you can safely ignore this email.</p>

            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }

    console.log("Verification email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
) => {
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Team Sync <teamsync@singhaman.me>",
      to: [email],
      subject: "Reset Your Password - Team Sync",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white;
              text-decoration: none;
              padding: 14px 30px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              transition: all 0.3s ease;
            }
            .button:hover {
              background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
            }
            .info-box {
              background: #f3f4f6;
              border-left: 4px solid #2563eb;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6b7280;
            }
            .link {
              color: #2563eb;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🔄 Team Sync</div>
              <h1 class="title">Reset Your Password</h1>
              <p class="subtitle">We received a request to reset your password</p>
            </div>

            <div class="content">
              <p>Hi ${userName},</p>

              <p>You requested to reset your password for your Team Sync account. Click the button below to create a new password:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>

              <div class="info-box">
                <strong>🔐 Security Information:</strong><br>
                • This link will expire in 1 hour for security reasons<br>
                • You can only use this link once<br>
                • If you didn't request this reset, you can safely ignore this email
              </div>

              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>

              <div class="warning-box">
                <strong>⚠️ Didn't request this?</strong><br>
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </div>
            </div>

            <div class="footer">
              <p>This email was sent by Team Sync</p>
              <p>If you have any questions, please contact our support team.</p>
              <p style="margin-top: 20px; font-size: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("Password reset email error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Team Sync <teamsync@singhaman.me>",
      to: [email],
      subject: "Welcome to Team Sync! 🎉",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Team Sync</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              background-color: #f8fafc;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 8px;
            }
            h1 {
              color: #1e293b;
              margin: 0 0 16px 0;
              font-size: 28px;
            }
            .cta-btn {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              text-decoration: none;
              padding: 16px 32px;
              border-radius: 8px;
              font-weight: 600;
              text-align: center;
              margin: 24px 0;
            }
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎉 Team Sync</div>
              <h1>You're all set!</h1>
            </div>

            <div class="content">
              <p>Hi ${userName},</p>

              <p>Congratulations! Your email has been verified and your Team Sync account is now active.</p>

              <p>You can now start organizing your projects, collaborating with your team, and tracking tasks efficiently.</p>

              <div style="text-align: center;">
                <a href="${config.CLIENT_URL}" class="cta-btn">Start Managing Projects</a>
              </div>

              <p>Here's what you can do next:</p>
              <ul>
                <li>🏢 Create your first workspace</li>
                <li>📁 Set up projects with custom emojis</li>
                <li>✅ Add tasks and set priorities</li>
                <li>👥 Invite team members to collaborate</li>
                <li>📊 Track progress with analytics</li>
              </ul>
            </div>

            <div class="footer">
              <p>Happy project managing!</p>
              <p>The Team Sync Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
      throw new Error("Failed to send welcome email");
    }

    return data;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};
