import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';
import { isAdminUser } from '@/lib/rbac';

const SESSION_COOKIE_NAME = 'smartonse_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'smartonse_super_secure_jwt_session_secret_2026_barangay_onse_san_juan'
);

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /api/admin API routes directly at the edge
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Unauthorized: Administrative authentication required.' },
          { status: 401 }
        )
      );
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string | undefined;

      if (!isAdminUser(role)) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Forbidden: Insufficient privileges.' },
            { status: 403 }
          )
        );
      }
    } catch {
      return applySecurityHeaders(
        NextResponse.json(
          { error: 'Unauthorized: Invalid or expired session.' },
          { status: 401 }
        )
      );
    }
  }

  // Protect /admin UI pages
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string | undefined;

      if (!isAdminUser(role)) {
        const forbiddenUrl = new URL('/portal/request', request.url);
        forbiddenUrl.searchParams.set('unauthorized', 'admin_only');
        return applySecurityHeaders(NextResponse.redirect(forbiddenUrl));
      }
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return applySecurityHeaders(res);
    }
  }

  // Protect /portal/request routes (must be logged in)
  if (pathname.startsWith('/portal/request')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      await jwtVerify(token, SECRET_KEY);
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return applySecurityHeaders(res);
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/admin/:path*', '/portal/request/:path*', '/api/admin/:path*'],
};
