
'use server';

import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tribe, User, TribeHistory } from '@/lib/types';
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
