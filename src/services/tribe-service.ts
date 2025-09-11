
'use server';

import { collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tribe, User, PastTribe as TribeHistory, MatchedUser } from '@/lib/types';
import { getAllUsers, getUser } from './user-service';
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
 * Retrieves all active tribes.
 * @returns A list of active tribes with their members.
 */
export async function getActiveTribes(): Promise<Tribe[]> {
  const allUsers = await getAllUsers();
  const usersInTribes = allUsers.filter(u => u.currentTribeId);

  if (usersInTribes.length === 0) {
    return [];
  }

  const tribesMap = new Map<string, User[]>();

  for (const user of usersInTribes) {
    if (user.currentTribeId) {
      if (!tribesMap.has(user.currentTribeId)) {
        tribesMap.set(user.currentTribeId, []);
      }
      tribesMap.get(user.currentTribeId)!.push(user);
    }
  }

  const tribes: Tribe[] = [];
  for (const [tribeId, members] of tribesMap.entries()) {
    tribes.push({
      id: tribeId,
      members: members,
      formedDate: members[0].lastTribeDate || new Date().toISOString(),
    });
  }

  return tribes;
}

/**
 * Retrieves the current tribe for a user.
 * @param userId The ID of the user.
 * @returns The tribe object with member details, or null if not in a tribe.
 */
export async function getCurrentTribe(userId: string): Promise<Tribe | null> {
  const user = await getUser(userId);
  if (!user || !user.currentTribeId) {
    return null;
  }

  const tribeId = user.currentTribeId;
  const usersInTribeQuery = query(collection(db, 'users'), where('currentTribeId', '==', tribeId));
  const userDocs = await getDocs(usersInTribeQuery);
  
  if (userDocs.empty) {
    return null;
  }

  const members = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  
  return {
    id: tribeId,
    members,
    formedDate: new Date().toISOString(), // This should be stored on the tribe doc ideally
  };
}

/**
 * Simulates retrieving a user's past tribe history.
 * For the demo, this returns a mock history.
 * @param userId The ID of the user.
 * @returns An array of past tribe histories.
 */
export async function getTribeHistory(userId: string): Promise<TribeHistory[]> {
  // Mock implementation
  // In a real app, you would query a 'tribe_history' collection.
  return [
    {
      tribeId: 'tribe_history_1',
      members: [], // Populate with past member data if needed
      formedDate: '2024-04-01',
      dissolvedDate: '2024-04-28',
      reason: 'The tribe completed its 4-week cycle.',
    },
  ];
}

export async function createTribe(tribeData: Omit<Tribe, 'id'>): Promise<Tribe> {
  const newTribeRef = doc(collection(db, 'tribes'));
  const newTribe: Tribe = {
    id: newTribeRef.id,
    ...tribeData,
    is_active: true,
  };
  await setDoc(newTribeRef, newTribe);
  return newTribe;
}

/**
 * Updates a tribe's data in Firestore.
 * @param tribeId The ID of the tribe to update.
 * @param updates An object containing the fields to update.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateTribe(tribeId: string, updates: Partial<Tribe>): Promise<void> {
  const tribeRef = doc(db, 'tribes', tribeId);
  await updateDoc(tribeRef, updates);
}

/**
 * Deletes a tribe and updates its members.
 * @param tribeId The ID of the tribe to delete.
 * @param members The members of the tribe.
 */
export async function deleteTribe(tribeId: string, members: MatchedUser[]): Promise<void> {
  const batch = writeBatch(db);

  // 1. Delete the tribe document
  const tribeRef = doc(db, 'tribes', tribeId);
  batch.delete(tribeRef);

  // 2. Update all members to remove them from the tribe
  for (const member of members) {
    const userRef = doc(db, 'users', member.userId);
    batch.update(userRef, { currentTribeId: null });
  }

  // 3. Commit the batch
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

    // Release all members of the tribe regardless of its status
    for (const member of tribe.members as MatchedUser[]) {
      const userRef = doc(db, 'users', member.userId);
      batch.update(userRef, { currentTribeId: null });
    }

    if (tribe.is_active) {
      // For active tribes, move them to the 'archived_tribes' collection
      const archivedTribeRef = doc(collection(db, 'archived_tribes'), tribe.id);
      batch.set(archivedTribeRef, { ...tribe, is_active: false }); // Mark as inactive upon archival
      batch.delete(originalTribeRef); // Delete from the main 'tribes' collection
    } else {
      // For inactive tribes, just delete them
      batch.delete(originalTribeRef);
    }
  }

  await batch.commit();
}
