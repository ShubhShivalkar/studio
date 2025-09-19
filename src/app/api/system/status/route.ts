
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Check if the admin SDK is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

export async function GET() {
  try {
    const statusRef = db.collection('system').doc('status');
    const statusSnap = await statusRef.get();

    if (statusSnap.exists) {
      const { isWaitlistActive } = statusSnap.data()!;
      return NextResponse.json({ isWaitlistActive });
    } else {
      // If the document doesn't exist, assume waitlist is not active
      return NextResponse.json({ isWaitlistActive: false });
    }
  } catch (error) {
    console.error('Error fetching system status:', error);
    // In case of an error, default to not activating the waitlist to avoid blocking the site
    return NextResponse.json({ isWaitlistActive: false }, { status: 500 });
  }
}
