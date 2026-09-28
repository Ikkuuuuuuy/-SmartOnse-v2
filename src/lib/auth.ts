import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'smartonse_session';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'smartonse_super_secure_jwt_session_secret_2026_barangay_onse_san_juan'
);

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleTitle?: string;
  destination?: string;
}

/**
 * Hash a plain text password using bcrypt with 10 salt rounds
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain text password against stored bcrypt hash
 * Gracefully handles legacy plaintext passwords by checking plain match as well
 */
export async function comparePassword(password: string, hashOrPlain: string): Promise<boolean> {
  if (!password || !hashOrPlain) return false;
  // If stored as bcrypt hash
  if (hashOrPlain.startsWith('$2a$') || hashOrPlain.startsWith('$2b$') || hashOrPlain.startsWith('$2y$')) {
    return bcrypt.compare(password, hashOrPlain);
  }
  // Fallback for legacy plaintext entries
  return password === hashOrPlain;
}

/**
 * Create a signed JWT session token valid for 7 days
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleTitle: user.roleTitle,
    destination: user.destination,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verify a JWT session token and return the parsed SessionUser
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
      roleTitle: payload.roleTitle as string | undefined,
      destination: payload.destination as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Get the currently authenticated user from incoming cookies in Next.js Server Components / Route Handlers
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
