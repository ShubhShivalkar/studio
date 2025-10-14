
import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Handle multiline private key
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
}
if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set.");
}
if (!clientEmail) {
  throw new Error("FIREBASE_CLIENT_EMAIL environment variable is not set.");
}

const serviceAccount = {
  projectId: projectId,
  privateKey: privateKey,
  clientEmail: clientEmail,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
