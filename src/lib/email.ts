import nodemailer from 'nodemailer';

// Configure SMTP Transporter using environment variables or fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export interface SendOtpOptions {
  to: string;
  name?: string;
  otp: string;
  purpose?: string;
}

/**
 * Sends a 6-digit OTP verification email with a branded Barangay Onse template.
 * If SMTP credentials are not configured, logs to console for local development testing.
 */
export async function sendOtpEmail({ to, name, otp, purpose = 'Two-Factor Authentication (2FA)' }: SendOtpOptions): Promise<{ success: boolean; simulated?: boolean }> {
  const recipientName = name || 'Resident / Official';
  const hasSmtpConfig = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SmartOnse Security Verification</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #9C2007; padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
        .header p { margin: 4px 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 15px; font-weight: 600; margin-bottom: 12px; }
        .instruction { font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .code-box { background: #fdf2f2; border: 2px dashed #f87171; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .otp-code { font-family: monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #9C2007; margin: 0; }
        .expiry { font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 500; }
        .notice { font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; line-height: 1.5; }
        .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Barangay Onse</h1>
          <p>San Juan City &bull; SmartOnse Digital Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Mabuhay, ${recipientName}!</div>
          <div class="instruction">
            You requested a security verification code for <strong>${purpose}</strong>. Please enter the following 6-digit code to complete verification:
          </div>
          <div class="code-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry">&bull; Valid for 5 minutes only &bull;</div>
          </div>
          <div class="notice">
            If you did not initiate this login or request, please disregard this email or report immediately to the Barangay Onse Administration. Do not share this code with anyone.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Barangay Onse &bull; Republic of the Philippines &bull; RA 10173 Protected
        </div>
      </div>
    </body>
    </html>
  `;

  if (!hasSmtpConfig) {
    console.log(`[SmartOnse EMAIL SIMULATION] To: ${to} | Purpose: ${purpose} | OTP: ${otp}`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Barangay Onse Portal" <${process.env.SMTP_USER}>`,
      to,
      subject: `[SmartOnse] Your Verification Code is ${otp}`,
      html: htmlContent,
      text: `Your SmartOnse verification code is: ${otp}. It will expire in 5 minutes.`,
    });
    return { success: true, simulated: false };
  } catch (err) {
    console.error('[SmartOnse EMAIL ERROR] Failed to send via SMTP:', err);
    // Fallback: log so dev/admin can still see the OTP during setup
    console.log(`[SmartOnse EMAIL FALLBACK] To: ${to} | OTP: ${otp}`);
    return { success: true, simulated: true };
  }
}

