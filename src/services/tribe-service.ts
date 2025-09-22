'use server';

import { collection, doc, getDoc, getDocs, query, where, writeBatch, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tribe, User, MatchedUser } from '@/lib/types';
import { getUser } from './user-service';
import { getNextMatchTime } from '@/lib/utils';

/**
 * Simulates getting tribe matching schedule information.
 * @returns An object with the schedule details.
 */
export async function getTribeScheduleInfo(): Promise<{ day: string; time: string; timezone: string; nextMatchDateTime: string; nextMondayFormatted: string; isMatchDay: boolean; }> {
  const { nextMatchDate, timeZone, isMatchDay } = getNextMatchTime('Asia/Kolkata', 1, 12); // 1 = Monday, 12 = 12:00 PM
  
  return {
    day: 'Monday',
    time: '12:00 PM',
    timezone: 'Asia/Kolkata',
    nextMatchDateTime: nextMatchDate.toISOString(),
    nextMondayFormatted: new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' }).format(nextMatchDate),
    isMatchDay,
  };
}

/**
 * Retrieves all tribes from the 'tribes' collection.
 * @returns A list of all tribes.
 */
export async function getAllTribes(): Promise<Tribe[]> {
    const tribesRef = collection(db, 'tribes');
    const querySnapshot = await getDocs(tribesRef);
    const tribes: Tribe[] = [];
    querySnapshot.forEach((doc) => {
        tribes.push({ id: doc.id, ...doc.data() } as Tribe);
    });
    return tribes;
}


/**
 * Retrieves all active tribes from the 'tribes' collection.
 * @returns A list of active tribes.
 */
export async function getActiveTribes(): Promise<Tribe[]> {
    const tribesRef = collection(db, 'tribes');
    const q = query(tribesRef, where('is_active', '==', true));
    const querySnapshot = await getDocs(q);
    const tribes: Tribe[] = [];
    querySnapshot.forEach((doc) => {
        tribes.push({ id: doc.id, ...doc.data() } as Tribe);
    });
    return tribes;
}

/**
 * Retrieves the current active tribe for a user by querying the tribes collection.
 * This is a more robust method than relying on a direct ID on the user object.
 * @param userId The ID of the user.
 * @returns The tribe object with member details, or null if not in an active tribe.
 */
export async function getCurrentTribe(userId: string): Promise<Tribe | null> {
  const tribesRef = collection(db, 'tribes');
  
  // Query for an active tribe where the user's ID is in the memberIds array.
  const q = query(
    tribesRef, 
    where('is_active', '==', true), 
    where('memberIds', 'array-contains', userId),
    limit(1) // A user should only be in one active tribe at a time.
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null; // No active tribe found for this user.
  }

  const tribeDoc = querySnapshot.docs[0];
  const tribeData = tribeDoc.data() as Tribe;

  // The tribe data already contains member info, but we need to enrich it 
  // with the full user object for each member, which is required by the UI.
  const memberPromises = tribeData.members.map(async (member) => {
      const memberUser = await getUser(member.userId);
      // Return the original member data but enriched with the full user object.
      return {
          ...member,
          user: memberUser, // The user object might be null if the user doc is missing.
      };
  });

  // Wait for all user profiles to be fetched.
  const membersWithUsers = (await Promise.all(memberPromises))
      // Filter out any members where the user document might have been deleted.
      .filter(m => m.user) as (MatchedUser & { user: User })[];

  return {
    ...tribeData,
    id: tribeDoc.id,
    members: membersWithUsers,
  };
}

/**
 * Retrieves a user's past tribes from the 'archived_tribes' collection.
 * @param userId The ID of the user.
 * @returns An array of past tribes.
 */
export async function getArchivedTribes(userId: string): Promise<Tribe[]> {
    const archivedTribesRef = collection(db, 'archived_tribes');
    const q = query(archivedTribesRef, where('memberIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return [];
    }

    const userTribes: Tribe[] = [];
    querySnapshot.forEach(doc => {
        userTribes.push({ id: doc.id, ...doc.data() } as Tribe);
    });

    return userTribes;
}

export async function createTribe(tribeData: Omit<Tribe, 'id' | 'overallCompatibilityScore'> & { overallCompatibilityScore?: number }): Promise<Tribe> {
    const batch = writeBatch(db);
    const newTribeRef = doc(collection(db, 'tribes'));
    
    // Ensure memberIds is created for querying.
    const memberIds = tribeData.members.map(member => (member as MatchedUser).userId);

    const newTribe: Tribe = {
        ...tribeData,
        id: newTribeRef.id,
        formedDate: new Date().toISOString(),
        memberIds: memberIds,
    } as Tribe;

    if (tribeData.overallCompatibilityScore !== undefined) {
      newTribe.overallCompatibilityScore = tribeData.overallCompatibilityScore;
    }
    
    batch.set(newTribeRef, newTribe);

    // Update users with their currentTribeId. While the primary query method is now direct,
    // this can still be useful for other parts of the app or for data consistency.
    for (const member of tribeData.members as MatchedUser[]) {
        const userRef = doc(db, 'users', member.userId);
        batch.update(userRef, { currentTribeId: newTribe.id, lastTribeDate: newTribe.formedDate });
    }

    await batch.commit();

    return newTribe as Tribe;
}


/**
 * Updates a tribe's data in Firestore.
 * @param tribeId The ID of the tribe to update.
 * @param updates An object containing the fields to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateTribe(tribeId: string, updates: Partial<Tribe>): Promise<void> {
  const tribeRef = doc(db, 'tribes', tribeId);
  const tribeDoc = await getDoc(tribeRef);

  if (!tribeDoc.exists()) {
    throw new Error(`Tribe with ID ${tribeId} not found for update.`);
  }

  await updateDoc(tribeRef, updates);
}

/**
 * Deletes a tribe and updates its members.
 * @param tribeId The ID of the tribe to delete.
 * @param members The members of the tribe.
 */
export async function deleteTribe(tribeId: string, members: MatchedUser[]): Promise<void> {
  const batch = writeBatch(db);

  const tribeRef = doc(db, 'tribes', tribeId);
  batch.delete(tribeRef);

  for (const member of members) {
    const userRef = doc(db, 'users', member.userId);
    batch.update(userRef, { currentTribeId: null });
  }

  await batch.commit();
}

/**
 * Updates the status of all tribes.
 * @param tribeIds The IDs of the tribes to update.
 * @param is_active The new active status.
 */
export async function updateAllTribesStatus(tribeIds: string[], is_active: boolean): Promise<void> {
  const batch = writeBatch(db);
  tribeIds.forEach(tribeId => {
    const tribeRef = doc(db, 'tribes', tribeId);
    batch.update(tribeRef, { is_active });
  });
  await batch.commit();
}

/**
 * Deletes inactive tribes and archives active ones.
 * @param tribes A list of all tribes to process.
 */
export async function deleteInactiveAndArchiveActiveTribes(tribes: Tribe[]): Promise<void> {
  const batch = writeBatch(db);

  for (const tribe of tribes) {
    const originalTribeRef = doc(db, 'tribes', tribe.id);

    for (const member of tribe.members as MatchedUser[]) {
      const userRef = doc(db, 'users', member.userId);
      batch.update(userRef, { currentTribeId: null });
    }

    if (tribe.is_active) {
      const archivedTribeRef = doc(collection(db, 'archived_tribes'), tribe.id);
      batch.set(archivedTribeRef, { ...tribe, is_active: false });
      batch.delete(originalTribeRef);
    } else {
      batch.delete(originalTribeRef);
    }
  }

  await batch.commit();
}
