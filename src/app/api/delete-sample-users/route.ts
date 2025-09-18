
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Check if the admin SDK is already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

/**
 * @swagger
 * /api/delete-sample-users:
 *   post:
 *     summary: Deletes specified sample users from Firebase Authentication and Firestore.
 *     description: This endpoint receives a list of user IDs and deletes them from both Firebase Authentication and the 'users' collection in Firestore.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of user UIDs to delete.
 *                 example: ["uid1", "uid2", "uid3"]
 *     responses:
 *       200:
 *         description: Successfully deleted sample users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Selected sample users have been deleted.
 *       400:
 *         description: Bad request if userIds are not provided.
 *       500:
 *         description: Internal server error.
 */
export async function POST(req: NextRequest) {
  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: 'User IDs are required.' }, { status: 400 });
    }

    // Delete users from Firebase Authentication
    const deleteResult = await admin.auth().deleteUsers(userIds);

    // Delete user documents from Firestore using a batch write
    const batch = db.batch();
    userIds.forEach((id: string) => {
        const userRef = db.collection('users').doc(id);
        batch.delete(userRef);
    });
    
    await batch.commit();

    return NextResponse.json({ message: `Successfully deleted ${deleteResult.successCount} sample users. Failed to delete ${deleteResult.failureCount} users.` });
  } catch (error) {
    console.error("Error deleting sample users:", error);
    // It's helpful to send back a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete sample users.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
