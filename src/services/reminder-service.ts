
'use server';

import { collection, query, where, getDocs, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Reminder } from '@/lib/types';
import { format } from 'date-fns';

/**
 * Retrieves all reminders for a user.
 * @param userId The UID of the user.
 * @returns An array of reminders.
 */
export async function getReminders(userId: string): Promise<Reminder[]> {
  const q = query(collection(db, 'reminders'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Firestore Timestamps need to be converted
    if (data.date instanceof Timestamp) {
        data.date = format(data.date.toDate(), 'yyyy-MM-dd');
    }
    return { id: doc.id, ...data } as Reminder
  });
}

/**
 * Creates a new reminder for a user.
 * @param userId The UID of the user.
 * @param reminderData The reminder data to save.
 * @returns The created reminder with its new ID.
 */
export async function createReminder(userId: string, reminderData: Omit<Reminder, 'id'>): Promise<Reminder> {
  const docRef = await addDoc(collection(db, 'reminders'), {
    ...reminderData,
    userId,
    date: Timestamp.fromDate(new Date(reminderData.date + 'T00:00:00')),
  });
  return { id: docRef.id, ...reminderData };
}

/**
 * Deletes a reminder.
 * @param reminderId The ID of the reminder document.
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  const docRef = doc(db, 'reminders', reminderId);
  await deleteDoc(docRef);
}
