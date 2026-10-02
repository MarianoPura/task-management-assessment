import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}reset-password?token=${resetToken}`;

    // Always log the reset link in the console for easy local testing
    console.log("--------------------------------------------------");
    console.log(`[PASSWORD RESET] Target Email: ${email}`);
    console.log(`[PASSWORD RESET] Reset Link: ${resetUrl}`);
    console.log("--------------------------------------------------");

    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim(); // remove all spaces from app password
    const port = Number(process.env.SMTP_PORT) || 587;
    const isGmail = host?.includes("gmail") || user?.includes("@gmail.com");

    if (user && pass) {
        try {
            console.log(`[PASSWORD RESET] Attempting to send email via SMTP to: ${email}...`);

            const transporter = nodemailer.createTransport(
                isGmail
                    ? {
                        service: "gmail",
                        auth: {
                            user,
                            pass,
                        },
                    }
                    : {
                        host: host || "localhost",
                        port,
                        secure: process.env.SMTP_SECURE === "true" || port === 465,
                        auth: {
                            user,
                            pass,
                        },
                    }
            );

            // Clean 'from' address
            let fromAddress = process.env.EMAIL_FROM?.replace(/['"]/g, "").trim() || user;
            if (!fromAddress.includes("<") && fromAddress.includes("@")) {
                fromAddress = `"To Do" <${fromAddress}>`;
            }

            const info = await transporter.sendMail({
                from: fromAddress,
                to: email,
                subject: "Reset Your Password - To Do",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
                        <p style="color: #334155; font-size: 15px; line-height: 1.5;">
                            You requested to reset your password for your <strong>To Do</strong> account. Click the button below to set a new password. This link is valid for 1 hour.
                        </p>
                        <div style="margin: 28px 0; text-align: center;">
                            <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #64748b; font-size: 13px; line-height: 1.4;">
                            If the button doesn't work, copy and paste this link into your browser:<br />
                            <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
                        </p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                            If you did not request this password reset, please ignore this email.
                        </p>
                    </div>
                `,
            });

            console.log(`[PASSWORD RESET] Email sent successfully to ${email}. Message ID: ${info.messageId}`);
        } catch (error) {
            console.error("[PASSWORD RESET] Failed to send email via SMTP:", error);
        }
    } else {
        console.log("[PASSWORD RESET] SMTP credentials not provided. Reset link logged to console only.");
    }
}
