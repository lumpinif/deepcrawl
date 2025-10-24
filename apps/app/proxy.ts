import { APP_COOKIE_PREFIX } from '@deepcrawl/auth/configs/constants';
import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { getAppRoute } from './lib/navigation-config';
import { authViewSegments } from './routes/auth';

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: APP_COOKIE_PREFIX,
  });

  const { pathname } = request.nextUrl;
  const isDeepcrawlAPIRoute = pathname.startsWith('/api/deepcrawl');

  // If no session cookie
  if (!sessionCookie) {
    if (isDeepcrawlAPIRoute) {
      return NextResponse.json({ error: 'Unauthorized!' }, { status: 401 });
    }

    // Logout requires session - redirect to login if no session
    if (pathname.startsWith(`/${authViewSegments.logout}`)) {
      return NextResponse.redirect(
        new URL(`/${authViewSegments.login}`, request.url),
      );
    }

    // Protect app routes - redirect unauthenticated users to login
    if (pathname.startsWith(getAppRoute())) {
      return NextResponse.redirect(
        new URL(`/${authViewSegments.login}`, request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Remove /logout from exclusions since we handle it in middleware now
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/deepcrawl/:path*',
  ],
};
