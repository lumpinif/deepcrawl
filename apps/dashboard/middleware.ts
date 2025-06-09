import { authViewPaths } from '@daveyplate/better-auth-ui';
import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

const enableRedirect = process.env.NODE_ENV === 'production' || false;

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: 'deepcrawl',
  });

  const { pathname } = request.nextUrl;

  // Define public auth routes that signed-in users shouldn't access
  // Use authViewPaths from better-auth-ui, but exclude 'settings' since it requires auth
  const publicAuthRoutes = Object.values(authViewPaths)
    .map((path) => `/${path}`)
    .filter((path) => path !== '/settings');

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Middleware Debug:', {
      path: pathname,
      sessionCookie: sessionCookie ? '✅ Found' : '❌ Not found',
      isPublicAuthRoute: publicAuthRoutes.includes(pathname),
    });
  }

  // If user is signed in and trying to access public auth routes, redirect to dashboard
  if (
    enableRedirect &&
    sessionCookie &&
    publicAuthRoutes
      .filter((path) => path !== '/login')
      .filter((path) => path !== '/sign-up')
      .filter((path) => path !== '/reset-password')
      .includes(pathname)
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is on a public auth route and has no session, allow access
  if (enableRedirect && !sessionCookie && publicAuthRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If no session cookie and not on a public auth route, redirect to login
  if (enableRedirect && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session cookie exists, allow the request
  return NextResponse.next();
}

export const config = {
  // Run middleware on protected routes AND public auth routes (to redirect signed-in users)
  // Exclude only sign-out and static assets
  matcher: ['/((?!auth/sign-out|api|_next/static|_next/image|favicon.ico).*)'],
};
