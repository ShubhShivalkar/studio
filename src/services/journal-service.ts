
'use server';

import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailySummary, User } from '@/lib/types';
import { format } from 'date-fns';

/**
 * Retrieves all journal entries for a user.
 * @param userId The UID of the user.
 * @returns An array of journal entries.
 */
export async function getJournalEntries(userId: string): Promise<DailySummary[]> {
  const q = query(collection(db, 'journalEntries'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Firestore Timestamps need to be converted to string dates
    if (data.date instanceof Timestamp) {
        data.date = format(data.date.toDate(), 'yyyy-MM-dd');
    }
    return { id: doc.id, ...data } as DailySummary
  });
}

/**
 * Creates or updates a journal entry for a specific date.
 * If a summary already exists for the day, the new summary will be appended.
 * @param userId The UID of the user.
 * @param entry The daily summary object.
 */
export async function setJournalEntry(userId: string, entry: Partial<DailySummary> & { date: string }): Promise<void> {
    const { date, ...entryData } = entry;
    const entryDate = new Date(date + 'T00:00:00'); // Ensure it's a clean date
    
    // Check if an entry for this date already exists
    const q = query(collection(db, 'journalEntries'), where('userId', '==', userId), where('date', '==', Timestamp.fromDate(entryDate)));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        // Create new entry
        const newEntryRef = doc(collection(db, 'journalEntries'));
        await setDoc(newEntryRef, {
            userId,
            date: Timestamp.fromDate(entryDate),
            ...entryData
        });
    } else {
        // Update existing entry
        const existingDoc = querySnapshot.docs[0];
        const docRef = existingDoc.ref;
        const existingData = existingDoc.data() as DailySummary;

        const updatePayload: Partial<DailySummary> = { ...entryData };

        // If a new summary is being added and one already exists, append it.
        if (entryData.summary && existingData.summary) {
            updatePayload.summary = `${existingData.summary}\n\n${entryData.summary}`;
        }
        
        await updateDoc(docRef, updatePayload);
    }
}

/**
 * Deletes a journal entry by its ID.
 * @param entryId The ID of the journal entry document.
 */
export async function deleteJournalEntry(entryId: string): Promise<void> {
  const docRef = doc(db, 'journalEntries', entryId);
  await deleteDoc(docRef);
}

/**
 * Adds a journal entry summary to a user's profile array.
 * This is used for persona generation.
 * @param userId The UID of the user.
 * @param summary The journal summary text.
 */
export async function addJournalSummaryToUser(userId: string, summary: string) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if(userSnap.exists()) {
        const userData = userSnap.data() as User;
        const updatedEntries = [...(userData.journalEntries || []), summary];
        await updateDoc(userRef, { journalEntries: updatedEntries });
    }
}
