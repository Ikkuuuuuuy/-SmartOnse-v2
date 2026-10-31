import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // Dynamically resolve app URL based on current host (supports localhost, vercel preview, and production)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'smartonse.vercel.app';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.redirect(
      new URL('/login?error=Google+Sign-In+is+not+configured+yet.+Please+add+GOOGLE_CLIENT_ID+and+GOOGLE_CLIENT_SECRET+to+.env', req.url)
    );
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'online');
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(googleAuthUrl.toString());
}
