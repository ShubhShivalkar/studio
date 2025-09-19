
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dev') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const statusResponse = await fetch(new URL('/api/system/status', request.url));

  if (statusResponse.ok) {
    const { isWaitlistActive } = await statusResponse.json();
    console.log('isWaitlistActive:', isWaitlistActive);

    if (isWaitlistActive && pathname !== '/waitlist') {
      return NextResponse.redirect(new URL('/waitlist', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
