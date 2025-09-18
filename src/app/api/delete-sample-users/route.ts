
import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

async function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return {
            app: getApps()[0],
            auth: getAuth(getApps()[0]),
            db: getFirestore(getApps()[0])
        }
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    const app = initializeApp({
        credential: {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
        },
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });

    return {
        app,
        auth: getAuth(app),
        db: getFirestore(app)
    };
}


export async function POST(req: NextRequest) {
  try {
    const { auth, db } = await initializeFirebaseAdmin();
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

  } catch (error: any)
  {
    console.error('An unexpected error occurred:', error);
    if (error.message.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
