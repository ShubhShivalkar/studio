
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin'; // Assuming you'll have firebase-admin initialized here

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ message: 'ID token is required' }, { status: 400 });
    }

    // Set session expiration to 5 days. The maximum is 2 weeks.
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ message: 'Session cookie created successfully' }, { status: 200 });

    response.cookies.set({
      name: '__session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ message: 'Failed to create session cookie', error: error.message }, { status: 500 });
  }
}
