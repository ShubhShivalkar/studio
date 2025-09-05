
'use server';

import { collection, doc, writeBatch, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Tribe } from '@/lib/types';
import { getDay, nextMonday, format } from 'date-fns';

/**
 * Gets information about the current tribe matching schedule.
 * @returns An object indicating if today is Match Day (Monday) and the date of the next Monday.
 */
export async function getTribeScheduleInfo() {
  const today = new Date();
  const isMatchDay = getDay(today) === 1; // 1 for Monday
  const nextMatchDay = nextMonday(today);
  
  return {
    isMatchDay,
    nextMondayFormatted: format(nextMatchDay, 'MMMM d, yyyy'),
  };
}


/**
 * Retrieves all active tribes from Firestore.
 * @returns An array of tribe objects.
 */
export async function getActiveTribes(): Promise<Tribe[]> {
  const q = query(collection(db, 'tribes'), where('isArchived', '==', false));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tribe));
}

/**
 * Archives all currently active tribes. This is typically run on Monday before new tribes are formed.
 */
export async function archiveAllActiveTribes(): Promise<void> {
  const batch = writeBatch(db);
  const activeTribes = await getActiveTribes();

  activeTribes.forEach(tribe => {
    const tribeRef = doc(db, 'tribes', tribe.id);
    batch.update(tribeRef, { isArchived: true, archivedAt: Timestamp.now() });
  });

  await batch.commit();
}

// Additional functions for creating, updating, and managing individual tribes can be added here.
