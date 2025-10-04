
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import type { Checklist } from '@/lib/types';
import { format } from 'date-fns';

/**
 * Retrieves all checklists for a user.
 * @param userId The UID of the user.
 * @returns An array of checklists.
 */
export async function getChecklists(userId: string): Promise<Checklist[]> {
  const q = adminDb.collection('checklists').where('userId', '==', userId);
  const querySnapshot = await q.get();
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    if (data.date instanceof Timestamp) {
        data.date = format(data.date.toDate(), 'yyyy-MM-dd');
    }
    return { id: doc.id, ...data } as Checklist
  });
}

/**
 * Creates a new checklist for a user.
 * @param userId The UID of the user.
 * @param checklistData The checklist data to save.
 * @returns The created checklist with its new ID.
 */
export async function createChecklist(userId: string, checklistData: Omit<Checklist, 'id'>): Promise<Checklist> {
  const docRef = await adminDb.collection('checklists').add({
    ...checklistData,
    userId,
    date: Timestamp.fromDate(new Date(checklistData.date + 'T00:00:00')),
  });
  return { id: docRef.id, ...checklistData };
}

/**
 * Deletes a checklist.
 * @param checklistId The ID of the checklist document.
 */
export async function deleteChecklist(checklistId: string): Promise<void> {
  const docRef = adminDb.collection('checklists').doc(checklistId);
  await docRef.delete();
}

/**
 * Updates a checklist (e.g., to toggle an item's completion).
 * @param checklistId The ID of the checklist document.
 * @param data The partial data to update.
 */
export async function updateChecklist(checklistId: string, data: Partial<Checklist>): Promise<void> {
  const docRef = adminDb.collection('checklists').doc(checklistId);
  await docRef.update(data);
}
