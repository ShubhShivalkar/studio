import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, orderBy, doc, updateDoc, arrayUnion, addDoc, deleteDoc } from "firebase/firestore";
import { DailySummary } from "@/lib/types";
import { format } from "date-fns";

/**
 * Upserts a manual journal entry for a specific user and date.
 * If an entry for the date exists, it will be updated; otherwise, a new one will be created.
 * @param userId The UID of the user.
 * @param dateString The date of the entry in 'yyyy-MM-dd' format.
 * @param summary The journal entry text.
 * @param mood The mood associated with the entry (optional).
 */
export async function upsertManualJournalEntry(
    userId: string,
    dateString: string,
    summary: string,
    mood?: DailySummary['mood']
) {
    const entryDate = new Date(dateString + 'T00:00:00');
    const journalEntryRef = collection(db, 'journalEntries');
    const q = query(journalEntryRef, where('userId', '==', userId), where('date', '==', Timestamp.fromDate(entryDate)));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Entry exists, update it
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { summary, mood, updatedAt: Timestamp.now() });
    } else {
        // No entry, create a new one
        await addDoc(journalEntryRef, {
            userId,
            date: Timestamp.fromDate(entryDate),
            summary,
            mood,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    }
}

/**
 * Retrieves a journal entry for a specific user and date.
 * @param userId The UID of the user.
 * @param dateString The date of the entry in 'yyyy-MM-dd' format.
 * @returns The DailySummary for the given date, or null if not found.
 */
export async function getJournalEntryForDate(userId: string, dateString: string): Promise<DailySummary | null> {
    const entryDate = new Date(dateString + 'T00:00:00');
    const q = query(
        collection(db, 'journalEntries'),
        where('userId', '==', userId),
        where('date', '==', Timestamp.fromDate(entryDate))
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        if (data.date instanceof Timestamp) {
            data.date = format(data.date.toDate(), 'yyyy-MM-dd');
        }
        return { id: doc.id, ...data } as DailySummary;
    }
    return null;
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
            data.date = format(data.date.toDate(), 'yyyy-MM-dd');
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
 * Sets a journal entry for a specific user and date. This will overwrite any existing entry for that date.
 * @param userId The UID of the user.
 * @param entry The DailySummary object to set.
 */
export async function setJournalEntry(userId: string, entry: Partial<DailySummary>) {
    const entryDate = new Date(entry.date + 'T00:00:00');
    const journalEntryRef = collection(db, 'journalEntries');
    const q = query(journalEntryRef, where('userId', '==', userId), where('date', '==', Timestamp.fromDate(entryDate)));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // Entry exists, update it
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { ...entry, date: Timestamp.fromDate(entryDate), updatedAt: Timestamp.now() });
    } else {
        // No entry, create a new one
        await addDoc(journalEntryRef, {
            userId,
            ...entry,
            date: Timestamp.fromDate(entryDate),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    }
}

/**
 * Adds a journal summary to the user's profile.
 * @param userId The UID of the user.
 * @param summary The summary text to add.
 */
export async function addJournalSummaryToUser(userId: string, summary: string) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        journalEntries: arrayUnion(summary)
    });
}

/**
 * Deletes a journal entry by its ID.
 * @param entryId The ID of the journal entry document to delete.
 */
export async function deleteJournalEntry(entryId: string) {
    const entryRef = doc(db, 'journalEntries', entryId);
    await deleteDoc(entryRef);
}
