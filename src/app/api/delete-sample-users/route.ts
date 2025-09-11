
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);

let app: App;
if (!getApps().length) {
  app = initializeApp({
    credential: {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    },
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db: Firestore = getFirestore(app);

export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ success: false, message: 'Invalid user IDs provided.' }, { status: 400 });
    }

    const deletePromises = userIds.map(async (uid) => {
      try {
        await auth.deleteUser(uid);
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.delete();
        return { uid, status: 'success' };
      } catch (error: any) {
        console.error(`Failed to delete user ${uid}:`, error);
        return { uid, status: 'error', message: error.message };
      }
    });

    const results = await Promise.all(deletePromises);
    
    const failedDeletes = results.filter(result => result.status === 'error');

    if (failedDeletes.length > 0) {
        // Even if some fail, we return a partial success response
        return NextResponse.json({ 
            success: false, 
            message: `Completed with some errors. ${failedDeletes.length} of ${userIds.length} users could not be deleted.`,
            failedDeletes,
        }, { status: 207 });
    }

    return NextResponse.json({ success: true, message: 'All sample users have been successfully deleted.' });

  } catch (error: any) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
