import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { getAppRoute } from './lib/navigation-config';
// import { authViewRoutes } from './routes/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: 'deepcrawl',
  });

  const { pathname } = request.nextUrl;

  // const publicAuthRoutes = Object.values(authViewRoutes).map(
  //   (path) => `/${path}`,
  // );

  // Handle logout route - requires session
  if (pathname === '/logout') {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // If no session cookie
  if (!sessionCookie) {
    // Allow access to public auth routes (login, register, etc.)
    // if (publicAuthRoutes.includes(pathname)) {
    //   return NextResponse.next();
    // }

    // // Redirect to login for all other routes
    // return NextResponse.redirect(new URL('/login', request.url));

    // Redirect to login for all app routes
    if (pathname.startsWith(getAppRoute())) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Has session - allow access to all routes
  return NextResponse.next();
}

export const config = {
  // Remove /logout from exclusions since we handle it in middleware now
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
