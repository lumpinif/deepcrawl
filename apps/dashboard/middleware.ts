import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const sessionCookie = getSessionCookie(request, {cookiePrefix: 'deepcrawl'});

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Middleware Debug:', {
            path: request.nextUrl.pathname,
            sessionCookie: sessionCookie ? '✅ Found' : '❌ Not found',
        });
    }
 
    // If no session cookie, redirect to login
    if (!sessionCookie) {
        console.log('🚫 No session cookie found, redirecting to login');
        return NextResponse.redirect(new URL("/login", request.url));
    }
 
    // Session cookie exists, allow the request
    console.log('✅ Session cookie found, allowing request');
    return NextResponse.next();
}

export const config = {
    // Protected routes - exclude auth pages and static assets
    matcher: [
        "/((?!login|signup|api|auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
