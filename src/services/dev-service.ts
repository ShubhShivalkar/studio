
'use server';

import { collection, writeBatch, query, where, getDocs, Timestamp, doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { DailySummary, Reminder, Checklist, User } from '@/lib/types';
import { subDays, format, parseISO } from 'date-fns';

const sampleDataIdentifier = { isSample: true };

// --- Sample Data Definitions ---

const createSampleJournalEntries = (userId: string): (Omit<DailySummary, 'id'> & { isSample: boolean; userId: string })[] => {
    const entries = [
      { daysAgo: 1, summary: "Spent the afternoon walking through the city, discovered a new coffee shop. The latte was incredible.", mood: '😊' },
      { daysAgo: 2, summary: "Feeling a bit stressed with a work deadline approaching, but I've mapped out a plan to get it done.", mood: '😐' },
      { daysAgo: 3, summary: "Had a surprise video call with an old friend from college. It was so good to catch up and laugh about old times.", mood: '😊' },
      { daysAgo: 4, summary: "Tried a new recipe for dinner. It was a bit of a disaster, but a funny story to tell.", mood: '😂' },
      { daysAgo: 5, summary: "Read a few chapters of a captivating novel in the park. It felt like a mini-vacation.", mood: '😊' },
      { daysAgo: 6, summary: "Productive day at work. Closed a major deal and got praise from the team.", mood: '🥳' },
      { daysAgo: 7, summary: "Was feeling a bit down today, so I listened to my favorite uplifting music. It helped a little.", mood: '😢' },
      { daysAgo: 8, summary: "Went for a long run this morning. The sunrise was beautiful and it cleared my head.", mood: '😌' },
      { daysAgo: 9, summary: "Binge-watched a new series all evening. Sometimes you just need to switch off.", mood: '📺' },
      { daysAgo: 10, summary: "Deep cleaned the entire apartment. It's so satisfying to have a tidy space.", mood: '😎' },
      { daysAgo: 11, summary: "Feeling a little uninspired. Tried to brainstorm some new ideas but nothing clicked.", mood: '😕' },
      { daysAgo: 12, summary: "Met up with some friends for a game night. Laughed so much my sides hurt.", mood: '😂' },
      { daysAgo: 13, summary: "Started planning a weekend getaway. The anticipation is half the fun!", mood: '✈️' },
      { daysAgo: 14, summary: "Volunteered at the local animal shelter. The puppies were adorable.", mood: '❤️' },
      { daysAgo: 15, summary: "Reflecting on the past two weeks. It's been a mix of highs and lows, but that's life.", mood: '🤔' },
    ];
    return entries.map(e => ({
        userId,
        date: format(subDays(new Date(), e.daysAgo), 'yyyy-MM-dd'),
        summary: e.summary,
        mood: e.mood as any,
        ...sampleDataIdentifier,
    }));
};

const createSampleReminders = (userId: string): (Omit<Reminder, 'id'> & { isSample: boolean; userId: string })[] => {
    const reminders = [
        { daysAgo: 0, time: '10:00', title: 'Doctor Appointment' },
        { daysAgo: -2, time: '18:30', title: 'Team Dinner', details: 'at The Italian Place' },
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

const createSampleChecklists = (userId: string): (Omit<Checklist, 'id'> & { isSample: boolean; userId: string })[] => {
    const checklists = [
        {
            daysAgo: -1,
            title: 'Weekend Trip Packing',
            items: [
                { id: '1', text: 'Toothbrush', completed: true },
                { id: '2', text: 'Passport', completed: false },
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
        batch.set(docRef, { ...entry, date: Timestamp.fromDate(parseISO(entry.date)) });
    });

    reminders.forEach(reminder => {
        const docRef = doc(collection(db, 'reminders'));
        batch.set(docRef, { ...reminder, date: Timestamp.fromDate(parseISO(reminder.date)) });
    });

    checklists.forEach(checklist => {
        const docRef = doc(collection(db, 'checklists'));
        batch.set(docRef, { ...checklist, date: Timestamp.fromDate(parseISO(checklist.date)) });
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
        mbti: deleteField(),
        personaLastGenerated: deleteField(),
        journalEntries: [],
    });
    
    await batch.commit();
}

// --- Static Data for Seeding ---
const maleFirstNames = ['Aarav', 'Vihaan', 'Aditya', 'Vivaan', 'Arjun', 'Sai', 'Reyansh', 'Mohammed', 'Ayaan', 'Krishna', 'Ishaan', 'Rohan', 'Kabir', 'Ansh', 'Aryan'];
const femaleFirstNames = ['Saanvi', 'Aadhya', 'Kiara', 'Diya', 'Pari', 'Ananya', 'Riya', 'Aaradhya', 'Ishita', 'Siddhi', 'Myra', 'Zara', 'Avni', 'Siya', 'Navya'];
const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Jain', 'Shah', 'Mehta', 'Verma', 'Yadav', 'Mishra', 'Reddy', 'Pillai', 'Iyer', 'Menon'];
const professions = ['Software Engineer', 'Doctor', 'Teacher', 'Accountant', 'Graphic Designer', 'Marketing Manager', 'Civil Engineer', 'Architect', 'Chef', 'Journalist', 'Data Scientist', 'Product Manager', 'UX Designer', 'Lawyer', 'Consultant'];
const hobbies = ['reading books', 'playing cricket', 'gardening', 'cooking new recipes', 'hiking in the mountains', 'photography', 'learning a new language', 'playing the guitar', 'watching movies', 'yoga and meditation', 'painting', 'dancing', 'writing poetry', 'cycling', 'volunteering'];
const interests = ['artificial intelligence', 'sustainable living', 'Indian history', 'stock market trends', 'modern art', 'space exploration', 'mental health awareness', 'blockchain technology', 'indie music', 'travel blogging', 'minimalism', 'quantum physics', 'film making', 'entrepreneurship', 'veganism'];

// --- Helper Functions for Seeding ---

// Function to get a random item from an array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Function to generate a random date of birth for a given age range
const getRandomDOB = (minAge: number, maxAge: number): string => {
    const today = new Date();
    const minBirthYear = today.getFullYear() - maxAge;
    const maxBirthYear = today.getFullYear() - minAge;
    const birthYear = Math.floor(Math.random() * (maxBirthYear - minBirthYear + 1)) + minBirthYear;
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1; // Simplifies date logic
    return new Date(birthYear, birthMonth, birthDay).toISOString().split('T')[0];
};

/**
 * Creates 100 sample user profiles in Firestore using static data.
 */
export async function seedSampleUsers(): Promise<void> {
    const batch = writeBatch(db);
    const locations = ['Panvel', 'Mumbai', 'Navi Mumbai'];
    const genders: ('Male' | 'Female')[] = ['Male', 'Female'];

    for (let i = 0; i < 100; i++) {
        const userId = `sample_user_${Date.now()}_${i}`; // Unique ID without faker
        const docRef = doc(db, 'users', userId);
        const gender = genders[i % 2];
        const firstName = gender === 'Male' ? getRandomItem(maleFirstNames) : getRandomItem(femaleFirstNames);
        const lastName = getRandomItem(lastNames);
        const profession = getRandomItem(professions);
        const userHobbies = [getRandomItem(hobbies), getRandomItem(hobbies)];
        const userInterests = [getRandomItem(interests), getRandomItem(interests)];

        const persona = `A thoughtful and introspective individual, ${firstName} works as a ${profession}. They are passionate about ${userHobbies.join(' and ')} and often find themselves exploring topics like ${userInterests[0]}. Friends and colleagues see them as a creative and driven person, yet they remain humble and approachable.`;

        const newUser: Omit<User, 'id'> = {
            name: `${firstName} ${lastName}`,
            dob: getRandomDOB(25, 30),
            gender,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@sample.com`,
            location: locations[i % locations.length],
            hobbies: userHobbies,
            interests: userInterests,
            mbti: 'INFP',
            profession,
            religion: 'Agnostic',
            persona,
            tribePreferences: {
                ageRange: [24, 32],
                gender: 'No Preference',
            },
            interestedInMeetups: true,
            is_sample_user: true,
            is_admin: false,
        };
        
        const dataToSave: any = {
            ...newUser,
            dob: Timestamp.fromDate(parseISO(newUser.dob)),
            lastActive: Timestamp.now(),
        };

        batch.set(docRef, dataToSave);
    }

    await batch.commit();
}
