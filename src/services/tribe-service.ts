
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
  
  const tribeRef = doc(db, 'tribes', tribeId);
  const tribeDoc = await getDoc(tribeRef);

  if (!tribeDoc.exists()) {
      console.warn(`User ${userId} has a stale tribe ID: ${tribeId}`);
      return null;
  }
  
  const tribeData = tribeDoc.data() as Tribe;

  const memberPromises = tribeData.members.map(async (member) => {
      const memberUser = await getUser(member.userId);
      return {
          ...member,
          user: memberUser, 
      };
  });

  const membersWithUsers = (await Promise.all(memberPromises)).filter(m => m.user);

  return {
    ...tribeData,
    id: tribeId,
    members: membersWithUsers,
  };
}

/**
 * Retrieves a user's past tribes from the 'archived_tribes' collection.
 * @param userId The ID of the user.
 * @returns An array of past tribes.
 */
export async function getArchivedTribes(userId: string): Promise<Tribe[]> {
    // NOTE: The original query was incorrect because Firestore's `array-contains`
    // cannot query for values within objects in an array. The correct, scalable
    // solution is to use an index of member IDs.
    //
    // To ensure existing data is visible, this function fetches all archived
    // tribes and filters them on the client. This is a temporary measure
    // until the data can be migrated to include the `memberIds` field.
    
    const archivedTribesRef = collection(db, 'archived_tribes');
    const querySnapshot = await getDocs(archivedTribesRef);
    
    if (querySnapshot.empty) {
        return [];
    }

    const userTribes: Tribe[] = [];
    querySnapshot.forEach(doc => {
        const tribe = { id: doc.id, ...doc.data() } as Tribe;
        if (tribe.members && tribe.members.some(member => member.userId === userId)) {
            userTribes.push(tribe);
        }
    });

    return userTribes;
}

export async function createTribe(tribeData: Omit<Tribe, 'id'>): Promise<Tribe> {
    const batch = writeBatch(db);
    const newTribeRef = doc(collection(db, 'tribes'));
    
    const memberIds = tribeData.members.map(member => (member as MatchedUser).userId);

    const newTribe = {
        ...tribeData,
        id: newTribeRef.id,
        formedDate: new Date().toISOString(),
        is_active: true,
        memberIds: memberIds, 
    };
    
    batch.set(newTribeRef, newTribe);

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
