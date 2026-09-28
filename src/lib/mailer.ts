import nodemailer from 'nodemailer';

const isGmail =
  (process.env.SMTP_HOST || '').toLowerCase().includes('gmail') ||
  (process.env.SMTP_USER || '').toLowerCase().endsWith('@gmail.com');

const cleanPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

export const transporter = nodemailer.createTransport(
  isGmail
    ? {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: cleanPass,
        },
      }
    : {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: cleanPass,
        },
      }
);

export async function sendEmailOtp({
  to,
  code,
  recipientName,
}: {
  to: string;
  code: string;
  recipientName?: string;
}) {
  const hasSmtpCredentials = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  const formattedDate = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Manila',
  }).format(new Date());

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartOnse Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text (shows in inbox list view) -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px; line-height: 1px; color: #fff;">
    Your Barangay Onse verification code is ${code}. Valid for 5 minutes. Do not share this code.
  </div>

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Government Brand Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7A1201 0%, #9C2007 60%, #B91C1C 100%); padding: 34px 28px 28px 28px; text-align: center; color: #ffffff;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <!-- Republic Subtitle Badge -->
                    <div style="display: inline-block; padding: 5px 16px; background: rgba(255, 255, 255, 0.16); border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 1.6px; text-transform: uppercase; color: #FEE2E2; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.22);">
                      Republika ng Pilipinas • Lungsod ng San Juan
                    </div>
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 0.8px; text-transform: uppercase; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.25);">
                      BARANGAY ONSE
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #FECACA; letter-spacing: 0.4px;">
                      SmartOnse Official Website • Resident Security Verification
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Golden Accent Strip -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #F59E0B 0%, #FDE68A 50%, #F59E0B 100%); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 32px 30px 32px; color: #1e293b;">
              
              <!-- Greeting -->
              <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #0f172a;">
                Magandang araw, ${recipientName || 'Resident'}! 👋
              </h2>
              
              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.65; color: #475569;">
                You are currently registering for an official resident profile on the <strong>SmartOnse Website</strong>. To confirm your identity and secure your account, please enter the single-use 6-digit code below:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 26px 0;">
                <tr>
                  <td align="center" style="background: #FFF5F5; border: 2px dashed #9C2007; border-radius: 18px; padding: 26px 20px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.8px; color: #9C2007; margin-bottom: 8px;">
                      Your Security Verification Code (OTP)
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #9C2007; padding: 6px 0;">
                      ${code}
                    </div>
                    <div style="margin-top: 12px; display: inline-block; background: #9C2007; color: #ffffff; padding: 4px 14px; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;">
                      ⏱️ Valid for 5 Minutes Only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Instructions -->
              <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 1.6; color: #64748b; text-align: center;">
                Enter this code in your registration browser window to continue to ID Verification.
              </p>

              <!-- Audit Details Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; font-size: 12px;">
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Request Purpose:</td>
                  <td style="padding: 5px 0; color: #0f172a; font-weight: 700; text-align: right;">New Resident Registration & RBI Census</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Date & Time (PHT):</td>
                  <td style="padding: 5px 0; color: #0f172a; font-weight: 700; text-align: right;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-weight: 600;">Security Channel:</td>
                  <td style="padding: 5px 0; color: #059669; font-weight: 700; text-align: right;">Official SMTP • TLS 1.3 Encrypted</td>
                </tr>
              </table>

              <!-- Security Warning Alert -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FEF3C7; border-left: 4px solid #D97706; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.55; color: #92400E;">
                    <strong style="color: #78350F;">🛡️ Security Notice:</strong> Barangay Onse officials, IT administrators, or staff members will <strong>NEVER</strong> contact you via phone call, text message, or social media to ask for this verification code or your password. Never share this code with anyone.
                  </td>
                </tr>
              </table>

              <p style="margin: 16px 0 0 0; font-size: 11px; line-height: 1.55; color: #94a3b8; text-align: center;">
                If you did not initiate this request, someone may have entered your email address by mistake. You can safely ignore this email; no changes can be made without this code.
              </p>
            </td>
          </tr>

          <!-- Government Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 26px 28px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-weight: 800; color: #f8fafc; text-transform: uppercase; letter-spacing: 0.6px; font-size: 12px;">
                Barangay Onse • City of San Juan, Metro Manila
              </p>
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 11px;">
                Barangay Hall, J. Perez St., Barangay Onse, San Juan City, Metro Manila<br>
                Office Hours: Monday – Friday, 8:00 AM – 5:00 PM PHT
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569; border-top: 1px solid #1e293b; padding-top: 12px;">
                This automated message was dispatched by the official SmartOnse Website in strict compliance with Republic Act No. 10173 (Data Privacy Act of 2012). Please do not reply directly to this automated email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  if (hasSmtpCredentials) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Barangay Onse" <${process.env.SMTP_USER}>`,
        to,
        subject: `[SmartOnse] Your 6-Digit Verification Code is ${code}`,
        text: `Magandang araw! Your Barangay Onse verification code is ${code}. It expires in 5 minutes. If you did not request this, please ignore this email.`,
        html: htmlContent,
      });
      console.log(`[SMTP Mailer] Email sent to ${to}: ${info.messageId}`);
      return { success: true, realSent: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[SMTP Mailer Error]', err);
      return { success: false, realSent: false, error: err.message, simulatedOtp: code };
    }
  } else {
    console.log(`[SMTP Mailer (Sandbox Mode)] Code for ${to}: ${code}`);
    return { success: true, realSent: false, simulatedOtp: code };
  }
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
  recipientName,
}: {
  to: string;
  resetUrl: string;
  recipientName?: string;
}) {
  const hasSmtpCredentials = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset Your Password</title></head>
<body style="font-family: sans-serif; background-color: #f8fafc; padding: 30px 10px;">
  <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #9C2007; margin: 0; font-size: 22px;">Barangay Onse, San Juan City</h1>
      <p style="color: #64748b; font-size: 13px; margin: 4px 0;">Official Citizen Account Recovery</p>
    </div>
    <p style="font-size: 14px; color: #1e293b;">Magandang araw, <strong>${recipientName || 'Citizen'}</strong>!</p>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      We received a request to reset your SmartOnse account password. Click the button below to set a new password. This link is valid for 1 hour.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #9C2007; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; font-size: 14px;">
        Reset My Password
      </a>
    </div>
    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      Or copy and paste this link in your browser:<br>
      <a href="${resetUrl}" style="color: #9C2007; word-break: break-all;">${resetUrl}</a>
    </p>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  </div>
</body>
</html>
  `;

  if (hasSmtpCredentials) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Barangay Onse" <${process.env.SMTP_USER}>`,
        to,
        subject: `[SmartOnse] Password Reset Request`,
        text: `Magandang araw! Reset your password by visiting: ${resetUrl}. This link expires in 1 hour.`,
        html: htmlContent,
      });
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[SMTP Password Reset Error]', err);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`[SMTP Mailer (Sandbox)] Password reset link for ${to}: ${resetUrl}`);
    return { success: true, sandbox: true };
  }
}

