
'use server';

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
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
export async function createUser(userId: string, data: Omit<User, 'id'>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, data);
}

/**
 * Updates an existing user's profile in Firestore.
 * @param userId The UID of the user.
 * @param data A partial object of the user's data to update.
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, data);
}

/**
 * Deletes all user profiles that have been marked as sample data.
 */
export async function deleteSampleUsers(): Promise<void> {
    const batch = writeBatch(db);
    const q = query(collection(db, 'users'), where('isSampleUser', '==', true));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    await batch.commit();
}
