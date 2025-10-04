import { NextRequest, NextResponse } from 'next/server';
// import { initializeApp, getApps } from 'firebase-admin/app';
// import { credential } from 'firebase-admin';

// Initialize Firebase Admin only once
// let adminAuth;
// if (process.env.NODE_ENV !== 'development') {
//   if (!getApps().length) {
//     try {
//       const serviceAccount = require('./serviceAccountKey.json');
//       initializeApp({
//         credential: credential.cert(serviceAccount),
//       });
//       console.log('Firebase Admin SDK initialized');
//     } catch (error: any) {
//       console.error('Failed to initialize Firebase Admin SDK:', error.message);
//     }
//   }

//   const { getAuth } = require('firebase-admin/auth');
//   adminAuth = getAuth();
// }

// Control variable for the waitlist redirection
// const WAITLIST_CONTROL_SWITCH = true; // Set to true to activate waitlist redirection

export async function middleware(req: NextRequest) {
  console.log("[Middleware] This is the very beginning of middleware");
  const { pathname } = req.nextUrl;

  // Paths that do not require authentication even if the waitlist is active
  const exemptedPaths = ['/waitlist', '/dev', '/api/sessionLogin']; // Added /api/sessionLogin to exempted paths

  // Check for the session cookie
  // const sessionCookie = req.cookies.get('__session')?.value;
  // let isAuthenticated = false;
  // let decodedClaims: any | null = null;

  console.log(`[Middleware] Pathname: ${pathname}`);
//  console.log(`[Middleware] WAITLIST_CONTROL_SWITCH: ${WAITLIST_CONTROL_SWITCH}`);
  // console.log(`[Middleware] Has __session cookie: ${!!sessionCookie}`);

  // if (sessionCookie && adminAuth) {
  //   try {
  //     decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true); // Check for revoked tokens
  //     isAuthenticated = true;
  //     console.log(`[Middleware] Session cookie verified for UID: ${decodedClaims.uid}`);
  //   } catch (error) {
  //     console.error('[Middleware] Error verifying session cookie:', error);
  //     // Session cookie is invalid or expired, clear it.
  //     const response = NextResponse.next();
  //     response.cookies.delete('__session');
  //     return response;
  //   }
  // }

  // console.log(`[Middleware] Is Authenticated (Session Cookie Active): ${isAuthenticated}`);

  // if (WAITLIST_CONTROL_SWITCH && !isAuthenticated) {
  if (true) {

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
     * - (Any other public assets or routes that should bypass this middleware)
     * NOTE: API routes can be explicitly exempted or handled within their own logic.
     */
    '/((?!_next/static|_next/image|favicon.ico).)','/','/profile'
  ],
};
