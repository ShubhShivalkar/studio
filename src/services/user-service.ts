
'use server';

import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, writeBatch, Timestamp, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { format, parseISO } from 'date-fns';

export interface WaitlistUser {
  name: string;
  dob: string;
  email: string;
  phone?: string;
  suggestions?: string;
  signupInterest: boolean;
  communicationInterest: boolean;
}

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
    // Re-fetch journal entries to ensure availability is up-to-date
    const journalQuery = query(
        collection(db, "journalEntries"), 
        where("userId", "==", userId),
        where("isAvailable", "==", true)
    );
    const journalSnapshot = await getDocs(journalQuery);
    data.availableDates = journalSnapshot.docs.map(doc => format(doc.data().date.toDate(), 'yyyy-MM-dd'));

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
 * Retrieves all user profiles from Firestore.
 * @returns An array of all users.
 */
export async function getAllUsers(): Promise<User[]> {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];

    // Create a map to hold the promises for fetching journal entries for each user
    const availabilityPromises = users.map(user => {
        const journalQuery = query(
            collection(db, "journalEntries"), 
            where("userId", "==", user.id),
            where("isAvailable", "==", true)
        );
        return getDocs(journalQuery).then(journalSnapshot => {
            return {
                userId: user.id,
                availableDates: journalSnapshot.docs.map(doc => format(doc.data().date.toDate(), 'yyyy-MM-dd'))
            };
        });
    });

    // Wait for all the promises to resolve
    const usersAvailability = await Promise.all(availabilityPromises);

    // Create a map for quick lookup of availability by userId
    const availabilityMap = new Map(usersAvailability.map(ua => [ua.userId, ua.availableDates]));

    // Merge the availability data with the user data
    const usersWithAvailability = users.map(user => {
        const data: any = { 
            ...user, 
            availableDates: availabilityMap.get(user.id) || [] 
        };
        
        if (data.dob && data.dob instanceof Timestamp) {
            data.dob = format(data.dob.toDate(), 'yyyy-MM-dd');
        }
        if (data.lastActive && data.lastActive instanceof Timestamp) {
            data.lastActive = data.lastActive.toDate().toISOString();
        }
        if (data.personaLastGenerated && data.personaLastGenerated instanceof Timestamp) {
            data.personaLastGenerated = data.personaLastGenerated.toDate().toISOString();
        }
        return data as User;
    });

    return usersWithAvailability;
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
    is_admin: false,
    is_sample_user: false, // Default to false for new users
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
  if (typeof data.dob === 'string' && data.dob.match(/^\d{4}-\d{2}-\d{2}$/)) {
    dataToUpdate.dob = Timestamp.fromDate(parseISO(data.dob));
  }
  if (typeof data.personaLastGenerated === 'string') {
    dataToUpdate.personaLastGenerated = Timestamp.fromDate(parseISO(data.personaLastGenerated));
  }

  await updateDoc(userDocRef, dataToUpdate);
}


/**
 * Deletes all sample user profiles from the database and Firebase Authentication.
 * Sample users are identified by the `is_sample_user` flag.
 */
export async function deleteSampleUsers(): Promise<void> {
    // First, get all the sample user IDs from Firestore
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('is_sample_user', '==', true));
    const sampleUsersSnapshot = await getDocs(q);
    const userIds = sampleUsersSnapshot.docs.map(doc => doc.id);

    if (userIds.length === 0) {
        console.log("No sample users to delete.");
        return;
    }

    // Now, call the API route to delete these users from Firebase Auth and Firestore
    const response = await fetch('/api/delete-sample-users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete sample users.');
    }
}


/**
 * Checks if a user with the given email already exists in the waitlist.
 * @param email The email to check.
 * @returns True if the user exists, false otherwise.
 */
export async function checkIfWaitlistUserExists(email: string): Promise<boolean> {
  const waitlistCollection = collection(db, 'waitlist');
  const q = query(waitlistCollection, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

/**
 * Adds a new user to the waitlist collection in Firestore.
 * @param data The waitlist user data to save.
 */
export async function addToWaitlist(data: WaitlistUser): Promise<string> {
  const waitlistCollection = collection(db, 'waitlist');
  const dataToSave = {
    ...data,
    dob: Timestamp.fromDate(parseISO(data.dob)),
    submittedAt: Timestamp.now(),
  };
  const docRef = await addDoc(waitlistCollection, dataToSave);
  return docRef.id;
}
