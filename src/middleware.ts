import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';
import { isAdminUser } from '@/lib/rbac';

const SESSION_COOKIE_NAME = 'smartonse_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'smartonse_super_secure_jwt_session_secret_2026_barangay_onse_san_juan'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string | undefined;

      if (!isAdminUser(role)) {
        // Logged in as resident or unauthorized role, redirect to forbidden/portal
        const forbiddenUrl = new URL('/portal/request', request.url);
        forbiddenUrl.searchParams.set('unauthorized', 'admin_only');
        return NextResponse.redirect(forbiddenUrl);
      }
    } catch {
      // Invalid or expired token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  // Protect /portal/request routes (must be logged in)
  if (pathname.startsWith('/portal/request')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, SECRET_KEY);
    } catch {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(SESSION_COOKIE_NAME);
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/portal/request/:path*'],
};
