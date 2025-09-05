
'use server';

import { collection, writeBatch, query, where, getDocs, Timestamp, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailySummary, Reminder, Checklist } from '@/lib/types';
import { subDays, format } from 'date-fns';

const sampleDataIdentifier = { isSample: true };

// --- Sample Data Definitions ---

const createSampleJournalEntries = (userId: string): (Omit<DailySummary, 'id'> & { isSample: boolean })[] => {
    const entries = [
      { daysAgo: 1, summary: "Spent the afternoon walking through the city, discovered a new coffee shop. The latte was incredible.", mood: '😊' },
      { daysAgo: 2, summary: "Feeling a bit stressed with a work deadline approaching, but I've mapped out a plan to get it done.", mood: '😐' },
      { daysAgo: 3, summary: "Had a surprise video call with an old friend from college. It was so good to catch up and laugh about old times.", mood: '😊' },
      { daysAgo: 5, summary: "Read a few chapters of a captivating novel in the park. It felt like a mini-vacation.", mood: '😊' },
      { daysAgo: 7, summary: "Was feeling a bit down today, so I listened to my favorite uplifting music. It helped a little.", mood: '😢' },
      { daysAgo: 8, summary: "Organized my closet and donated a bag of clothes. It feels so good to declutter and simplify.", mood: '😊' },
      { daysAgo: 10, summary: "Started looking into pottery classes. I'm excited to try something new and creative.", mood: '😮' },
      { daysAgo: 12, summary: "A project at work isn't going as planned. Feeling frustrated but determined to find a solution.", mood: '😠' },
      { daysAgo: 14, summary: "Watched a documentary about space exploration. It was mind-blowing and left me feeling inspired.", mood: '😮' },
      { daysAgo: 15, summary: "I'm grateful for my family's support. Had a lovely dinner with them tonight.", mood: '😊' },
      { daysAgo: 16, summary: "A quiet Sunday spent at home, sketching and relaxing. It was just what I needed.", mood: '😐' },
      { daysAgo: 18, summary: "Pushed myself to go for a run even though I didn't feel like it. Felt amazing afterward.", mood: '😊' },
      { daysAgo: 20, summary: "Disappointed that a concert I was looking forward to got postponed.", mood: '😢' },
      { daysAgo: 22, summary: "Had a deep conversation with a friend about our goals and dreams. Feeling very connected.", mood: '😊' },
      { daysAgo: 25, summary: "Finished a challenging puzzle I've been working on for days. The sense of accomplishment is great!", mood: '😊' },
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
        details: r.details || null,
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
 * Deletes all data for a specific user, including journal entries, reminders,
 * checklists, and resets persona-related fields on the user profile.
 * @param userId The UID of the user whose data will be deleted.
 */
export async function deleteAllUserData(userId: string): Promise<void> {
    const batch = writeBatch(db);

    // 1. Delete all documents from related collections
    const collectionsToDelete: string[] = ['journalEntries', 'reminders', 'checklists'];
    for (const collectionName of collectionsToDelete) {
        const q = query(collection(db, collectionName), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
    }

    // 2. Reset user profile fields
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
        persona: deleteField(),
        hobbies: deleteField(),
        interests: deleteField(),
        personalityTraits: deleteField(),
        personaLastGenerated: deleteField(),
        journalEntries: [], // Reset to an empty array
    });
    
    await batch.commit();
}
