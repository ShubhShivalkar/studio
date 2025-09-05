
'use server';

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { format, parseISO } from 'date-fns';

/**
 * Retrieves a user's profile from Firestore.
 * @param userId The UID of the user.
 * @returns The user object or null if not found.
 */
export async function getUser(userId: string): Promise<User | null> {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (data.dob && data.dob instanceof Timestamp) {
        data.dob = format(data.dob.toDate(), 'yyyy-MM-dd');
    }
    if (data.lastActive && data.lastActive instanceof Timestamp) {
        data.lastActive = data.lastActive.toDate().toISOString();
    }
    if (data.personaLastGenerated && data.personaLastGenerated instanceof Timestamp) {
        data.personaLastGenerated = data.personaLastGenerated.toDate().toISOString();
    }
    return { id: userDoc.id, ...data } as User;
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
  const dataToSave: any = { 
    ...data,
    lastActive: Timestamp.now(), // Set initial activity
  };

  if(data.dob) {
    dataToSave.dob = Timestamp.fromDate(parseISO(data.dob));
  }
  
  await setDoc(userDocRef, dataToSave);
}

/**
 * Updates an existing user's profile in Firestore.
 * @param userId The UID of the user.
 * @param data A partial object of the user's data to update.
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  const dataToUpdate: any = { 
    ...data,
    lastActive: Timestamp.now(), // Always update activity on any change
  };

  // Only convert dates if they are provided as new strings
  if (typeof data.dob === 'string') {
    dataToUpdate.dob = Timestamp.fromDate(parseISO(data.dob));
  }
  if (typeof data.personaLastGenerated === 'string') {
    dataToUpdate.personaLastGenerated = Timestamp.fromDate(parseISO(data.personaLastGenerated));
  }

  await updateDoc(userDocRef, dataToUpdate);
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
