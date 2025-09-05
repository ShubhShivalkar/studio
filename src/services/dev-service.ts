
'use server';

import { collection, writeBatch, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailySummary, Reminder, Checklist } from '@/lib/types';
import { subDays, format } from 'date-fns';

const sampleDataIdentifier = { isSample: true };

// --- Sample Data Definitions ---

const createSampleJournalEntries = (userId: string): (Omit<DailySummary, 'id'> & { isSample: boolean })[] => {
    const entries = [
        { daysAgo: 1, summary: "Had a wonderful time hiking today. The weather was perfect.", mood: '😊' },
        { daysAgo: 2, summary: "Feeling a bit overwhelmed with work, but I managed to finish a big project.", mood: '😐' },
        { daysAgo: 3, summary: "Tried a new recipe for dinner and it was a disaster. At least it was a funny story.", mood: '😮' },
        { daysAgo: 5, summary: "Spent the afternoon reading in the park. It was so peaceful.", mood: '😊' },
        { daysAgo: 7, summary: "A difficult conversation with a friend left me feeling sad.", mood: '😢' },
        { daysAgo: 8, summary: "Finally fixed that leaky faucet. I feel so accomplished!", mood: '😊' },
        { daysAgo: 10, summary: "Started planning a weekend trip. Very excited about it.", mood: '😊' },
        { daysAgo: 12, summary: "Work was frustrating today. Nothing seemed to go right.", mood: '😠' },
        { daysAgo: 14, summary: "Watched a great movie tonight. It really made me think.", mood: '😮' },
        { daysAgo: 15, summary: "Feeling grateful for my family and their support.", mood: '😊' },
        { daysAgo: 16, summary: "Lazy Sunday. Didn't do much and it was glorious.", mood: '😐' },
        { daysAgo: 18, summary: "Hit a new personal best at the gym. All the hard work is paying off.", mood: '😊' },
        { daysAgo: 20, summary: "A sudden rainstorm ruined my plans, which was a bit of a downer.", mood: '😢' },
        { daysAgo: 22, summary: "Reconnected with an old friend over the phone. It was so good to catch up.", mood: '😊' },
        { daysAgo: 25, summary: "Finished a book that I've been reading for weeks. The ending was a surprise!", mood: '😮' },
    ];
    return entries.map(e => ({
        userId,
        date: format(subDays(new Date(), e.daysAgo), 'yyyy-MM-dd'),
        summary: e.summary,
        mood: e.mood as any,
        ...sampleDataIdentifier,
    }));
};

const createSampleReminders = (userId: string): (Omit<Reminder, 'id'> & { isSample: boolean })[] => {
    const reminders = [
        { daysAgo: 0, time: '10:00', title: 'Doctor Appointment' },
        { daysAgo: -2, time: '18:30', title: 'Team Dinner', details: 'at The Italian Place' },
        { daysAgo: -5, time: '09:00', title: 'Submit quarterly report' },
    ];
    return reminders.map(r => ({
        userId,
        date: format(subDays(new Date(), r.daysAgo), 'yyyy-MM-dd'),
        time: r.time,
        title: r.title,
        details: r.details,
        ...sampleDataIdentifier,
    }));
};

const createSampleChecklists = (userId: string): (Omit<Checklist, 'id'> & { isSample: boolean })[] => {
    const checklists = [
        {
            daysAgo: -1,
            title: 'Weekend Trip Packing',
            items: [
                { id: '1', text: 'Toothbrush', completed: true },
                { id: '2', text: 'Passport', completed: false },
                { id: '3', text: 'Phone charger', completed: true },
            ],
        },
        {
            daysAgo: 4,
            title: 'Grocery List',
            items: [
                { id: '1', text: 'Milk', completed: true },
                { id: '2', text: 'Bread', completed: true },
                { id: '3', text: 'Eggs', completed: false },
            ],
        },
    ];
    return checklists.map(c => ({
        userId,
        date: format(subDays(new Date(), c.daysAgo), 'yyyy-MM-dd'),
        title: c.title,
        items: c.items,
        ...sampleDataIdentifier,
    }));
};

// --- Service Functions ---

/**
 * Adds a full set of sample entries for a user.
 * @param userId The UID of the user.
 */
export async function addSampleEntries(userId: string): Promise<void> {
    const batch = writeBatch(db);

    const journalEntries = createSampleJournalEntries(userId);
    const reminders = createSampleReminders(userId);
    const checklists = createSampleChecklists(userId);

    journalEntries.forEach(entry => {
        const docRef = doc(collection(db, 'journalEntries'));
        batch.set(docRef, { ...entry, date: Timestamp.fromDate(new Date(entry.date + 'T00:00:00')) });
    });

    reminders.forEach(reminder => {
        const docRef = doc(collection(db, 'reminders'));
        batch.set(docRef, { ...reminder, date: Timestamp.fromDate(new Date(reminder.date + 'T00:00:00')) });
    });

    checklists.forEach(checklist => {
        const docRef = doc(collection(db, 'checklists'));
        batch.set(docRef, { ...checklist, date: Timestamp.fromDate(new Date(checklist.date + 'T00:00:00')) });
    });

    await batch.commit();
}

/**
 * Deletes all sample entries for a user.
 * @param userId The UID of the user.
 */
export async function deleteSampleEntries(userId: string): Promise<void> {
    const batch = writeBatch(db);
    const collections: (keyof typeof sampleDataIdentifier)[] = ['journalEntries', 'reminders', 'checklists'];

    for (const collectionName of collections) {
        const q = query(
            collection(db, collectionName as string), 
            where('userId', '==', userId), 
            where('isSample', '==', true)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
    }

    await batch.commit();
}
