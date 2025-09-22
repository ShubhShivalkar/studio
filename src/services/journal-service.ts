import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, orderBy, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { DailySummary } from "@/lib/types";
import { format, startOfDay, endOfDay } from "date-fns";

/**
 * Adds a new manual journal entry for a specific user.
 * @param userId The UID of the user.
 * @param dateString The full ISO date string of the entry (e.g., 'YYYY-MM-DDTHH:MM:SSZ').
 * @param summary The journal entry text.
 * @param mood The mood associated with the entry (optional).
 * @param title The title of the entry (optional).
 * @param image The URL of an image for the entry (optional).
 * @param collectionTag A tag to categorize the entry (optional).
 * @param isAvailable A boolean indicating if the user is available for tribe meetups (optional).
 * @returns A DocumentReference for the newly added document.
 */
export async function addManualJournalEntry(
    userId: string,
    dateString: string,
    summary: string,
    mood?: DailySummary['mood'],
    title?: string,
    image?: string,
    collectionTag?: string,
    isAvailable?: boolean
) {
    const journalEntryRef = collection(db, 'journalEntries');
    const newEntry: any = {
        userId,
        date: Timestamp.fromDate(new Date(dateString)),
        summary,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    };
    if (mood) { newEntry.mood = mood; }
    if (title) { newEntry.title = title; }
    if (image) { newEntry.image = image; }
    if (collectionTag) { newEntry.collectionTag = collectionTag; }
    if (isAvailable !== undefined) { newEntry.isAvailable = isAvailable; }
    
    return await addDoc(journalEntryRef, newEntry);
}

/**
 * Retrieves all journal entries for a specific user on a given date.
 * @param userId The UID of the user.
 * @param dateString The date in 'yyyy-MM-dd' format.
 * @returns An array of DailySummary objects for the given date, or an empty array if none found.
 */
export async function getJournalEntriesForDate(userId: string, dateString: string): Promise<DailySummary[]> {
    const start = startOfDay(new Date(dateString));
    const end = endOfDay(new Date(dateString));

    const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(start)),
        where('date', '<=', Timestamp.fromDate(end)),
        orderBy('date', 'asc') // Order by date to display chronologically
    );
    const querySnapshot = await getDocs(q);

    const entries: DailySummary[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date instanceof Timestamp) {
            data.date = data.date.toDate().toISOString(); // Convert to ISO string
        }
        entries.push({ id: doc.id, ...data } as DailySummary);
    });
    return entries;
}

/**
 * Updates an existing journal entry.
 * @param entryId The ID of the journal entry document to update.
 * @param summary The updated journal entry text.
 * @param mood The updated mood associated with the entry (optional).
 * @param title The updated title of the entry (optional).
 * @param image The updated URL of an image for the entry (optional).
 * @param collectionTag The updated tag to categorize the entry (optional).
 * @param isAvailable The updated availability status (optional).
 */
export async function updateJournalEntry(
    entryId: string,
    summary: string,
    mood?: DailySummary['mood'],
    title?: string,
    image?: string,
    collectionTag?: string,
    isAvailable?: boolean
) {
    const entryRef = doc(db, 'journalEntries', entryId);
    const updatedFields: any = { summary, updatedAt: Timestamp.now() };
    
    if (mood) { updatedFields.mood = mood; } else { updatedFields.mood = null; }
    if (title) { updatedFields.title = title; } else { updatedFields.title = null; }
    if (image) { updatedFields.image = image; } else { updatedFields.image = null; }
    if (collectionTag) { updatedFields.collectionTag = collectionTag; } else { updatedFields.collectionTag = null; }
    if (isAvailable !== undefined) { updatedFields.isAvailable = isAvailable; }
    
    await updateDoc(entryRef, updatedFields);
}

/**
 * Retrieves all journal entries for a specific user.
 * @param userId The UID of the user.
 * @returns An array of DailySummary objects, sorted by date in descending order.
 */
export async function getAllJournalEntries(userId: string): Promise<DailySummary[]> {
    const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const entries: DailySummary[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.date instanceof Timestamp) {
            data.date = data.date.toDate().toISOString();
        }
        entries.push({ id: doc.id, ...data } as DailySummary);
    });
    return entries;
}

// Alias for getAllJournalEntries, as used in journal-chat.tsx
export async function getJournalEntries(userId: string): Promise<DailySummary[]> {
    return getAllJournalEntries(userId);
}

/**
 * Deletes a journal entry by its ID.
 * @param entryId The ID of the journal entry document to delete.
 */
export async function deleteJournalEntry(entryId: string) {
    const entryRef = doc(db, 'journalEntries', entryId);
    await deleteDoc(entryRef);
}
