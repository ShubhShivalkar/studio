
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';

/**
 * Retrieves a user's profile from Firestore.
 * @param userId The UID of the user.
 * @returns The user object or null if not found.
 */
export async function getUser(userId: string): Promise<User | null> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }
  return null;
}

/**
 * Creates a new user profile in Firestore.
 * @param userId The UID of the user from Firebase Auth.
 * @param data The user profile data to save.
 */
export async function createUser(userId: string, data: User): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  // Omit the id from the data being written to the document, as it's the document's key.
  const { id, ...userData } = data;
  await setDoc(userDocRef, userData);
}
