
import { doc, getDoc, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { faker } from '@faker-js/faker';

/**
 * Adds 15 sample journal entries to the specified user's profile.
 * @param userId - The ID of the user to add sample entries to.
 */
export const addSampleEntries = async (userId: string) => {
    const batch = writeBatch(db);
    const userJournalEntriesRef = doc(db, 'journalEntries', userId);

    const entries: { [key: string]: any } = {};
    for (let i = 0; i < 15; i++) {
        const entryId = faker.string.uuid();
        entries[entryId] = {
            content: faker.lorem.paragraph(),
            date: faker.date.recent({ days: 30 }).toISOString(),
            is_private: false,
            is_available: true,
        };
    }

    await setDoc(userJournalEntriesRef, { entries }, { merge: true });
    
    // Also update the user's profile to indicate they have enough entries
    const userProfileRef = doc(db, 'users', userId);
    await updateDoc(userProfileRef, { has_enough_entries: true });
};

/**
 * Deletes all data associated with a user, including their journal entries and profile.
 * @param userId - The ID of the user to delete.
 */
export const deleteAllUserData = async (userId: string) => {
    const batch = writeBatch(db);

    const userProfileRef = doc(db, 'users', userId);
    const userJournalEntriesRef = doc(db, 'journalEntries', userId);
    const userPersonaRef = doc(db, 'personas', userId);
    
    batch.delete(userJournalEntriesRef);
    batch.delete(userPersonaRef);
    batch.update(userProfileRef, {
        persona: null,
        has_enough_entries: false,
        is_matched: false,
        tribe_id: null,
        interestedInMeetups: false,
    });

    await batch.commit();
};

/**
 * Creates 100 sample user documents in the database.
 */
export const seedSampleUsers = async () => {
    const batch = writeBatch(db);

    for (let i = 0; i < 100; i++) {
        const userId = faker.string.uuid();
        const userRef = doc(db, 'users', userId);
        batch.set(userRef, {
            id: userId,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
            phone: `+91${faker.phone.number('##########')}`,
            is_admin: false,
            is_sample_user: true,
            has_enough_entries: false,
            persona: null,
            is_matched: false,
            tribe_id: null,
        });
    }

    await batch.commit();
};


/**
 * Retrieves the system status, including the waitlist status.
 * @returns The system status document data.
 */
export const getSystemStatus = async () => {
    const statusRef = doc(db, 'system', 'status');
    const statusSnap = await getDoc(statusRef);
    return statusSnap.exists() ? statusSnap.data() : null;
};

/**
 * Updates the waitlist status in the system status document.
 * @param isActive - The new value for the isWaitlistActive field.
 */
export const updateWaitlistStatus = async (isActive: boolean) => {
    const statusRef = doc(db, 'system', 'status');
    await setDoc(statusRef, { isWaitlistActive: isActive }, { merge: true });
};
