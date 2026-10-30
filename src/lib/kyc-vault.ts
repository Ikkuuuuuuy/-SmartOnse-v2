import crypto from 'crypto';

// Secret key for signing KYC access URLs
const KYC_STORAGE_SECRET = process.env.KYC_SECRET_KEY || process.env.SESSION_SECRET || 'smartonse_kyc_pii_vault_secret_key_2026';

export interface SignedKycUrlOptions {
  documentId: string;
  userId: string;
  expiresInSeconds?: number; // default: 900 seconds (15 minutes)
}

/**
 * Generates a time-limited HMAC-SHA256 signed URL to access private PII / KYC documents.
 * This guarantees that even if a URL is intercepted, it expires automatically and cannot be forged.
 */
export function generateSignedKycUrl({
  documentId,
  userId,
  expiresInSeconds = 900,
}: SignedKycUrlOptions): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${documentId}:${userId}:${expiresAt}`;
  const signature = crypto
    .createHmac('sha256', KYC_STORAGE_SECRET)
    .update(payload)
    .digest('hex');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return `${appUrl}/api/kyc/view?doc=${encodeURIComponent(documentId)}&user=${encodeURIComponent(userId)}&exp=${expiresAt}&sig=${signature}`;
}

/**
 * Validates the time and cryptographic signature of an incoming KYC document request.
 */
export function verifySignedKycUrl(
  documentId: string,
  userId: string,
  expiresAtStr: string,
  signature: string
): { valid: boolean; reason?: string } {
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) {
    return { valid: false, reason: 'Invalid expiration timestamp.' };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds > expiresAt) {
    return { valid: false, reason: 'KYC Document link has expired (15-minute validity window).' };
  }

  const payload = `${documentId}:${userId}:${expiresAt}`;
  const expectedSignature = crypto
    .createHmac('sha256', KYC_STORAGE_SECRET)
    .update(payload)
    .digest('hex');

  // Constant-time buffer comparison to prevent timing attacks
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );

  if (!isMatch) {
    return { valid: false, reason: 'Invalid cryptographic signature.' };
  }

  return { valid: true };
}

