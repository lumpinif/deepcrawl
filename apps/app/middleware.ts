import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { getAppRoute } from './lib/navigation-config';
// import { authViewRoutes } from './routes/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: 'deepcrawl',
  });

  const { pathname } = request.nextUrl;

  // If no session cookie
  if (!sessionCookie) {
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
