import { NextRequest, NextResponse } from 'next/server';

// Control variable for the waitlist redirection
const WAITLIST_CONTROL_SWITCH = false; // Set to true to activate waitlist redirection

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Paths that do not require authentication even if the waitlist is active
  const exemptedPaths = ['/waitlist', '/dev'];

  // Check if the user is authenticated (simplified check: presence of a session cookie)
  // In a real application, you would typically verify a Firebase ID token from a cookie
  // or a custom server-side session cookie set after successful client-side Firebase auth.
  // For demonstration, we'll check for a common session cookie.
  const hasSessionCookie = req.cookies.has('__session');
  const isAuthenticated = hasSessionCookie; // Placeholder for actual auth check

  console.log(`[Middleware] Pathname: ${pathname}`);
  console.log(`[Middleware] WAITLIST_CONTROL_SWITCH: ${WAITLIST_CONTROL_SWITCH}`);
  console.log(`[Middleware] Has __session cookie: ${hasSessionCookie}`);
  console.log(`[Middleware] Is Authenticated (based on cookie): ${isAuthenticated}`);

  if (WAITLIST_CONTROL_SWITCH && !isAuthenticated) {
    // If the waitlist is active, the user is unauthorized, and they are not on an exempted path
    if (!exemptedPaths.includes(pathname)) {
      console.log(`[Middleware] Redirecting unauthorized user from ${pathname} to /waitlist`);
      // Redirect to the waitlist page
      return NextResponse.redirect(new URL('/waitlist', req.url));
    }
    console.log(`[Middleware] Not redirecting ${pathname} as it's an exempted path.`);
  }

  // If the waitlist is not active, or the user is authenticated, or the path is exempted,
  // allow the request to proceed.
  console.log(`[Middleware] Allowing request for ${pathname}`);
  return NextResponse.next();
}

// Configuration for the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes, if they have their own auth logic)
     * - (Any other public assets or routes that should bypass this middleware)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
