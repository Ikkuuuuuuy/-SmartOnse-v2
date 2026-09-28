/**
 * SmartOnse In-Memory Phone OTP Store
 * 100% Native, zero external SMS API dependency.
 * Stores 6-digit verification codes with 5-minute expiry.
 */

export interface OtpEntry {
  code: string;
  expiresAt: number; // Unix timestamp in ms
  attempts: number;
  verified: boolean;
}

const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpEntry>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpEntry>();
globalForOtp.otpStore = otpStore;

export function cleanExpiredOtps() {
  const now = Date.now();
  for (const [phone, entry] of otpStore.entries()) {
    if (entry.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}
