
import type { User, Connection, DailySummary, Reminder, Checklist } from './types';
import { differenceInYears } from 'date-fns';

// Helper to calculate age
const getAge = (dob: string) => differenceInYears(new Date(), new Date(dob));


// The user who is currently logged in.
// Initially, it's a new user. After "login", this object will be updated.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: 'https://picsum.photos/seed/anewuser/200',
  dob: '1996-10-15', // Example DOB
  gender: 'Female',
  journalEntries: [],
  phone: '',
  // Persona is initially undefined until generated
  persona: undefined,
  interestedInMeetups: false,
};

// This represents our "database" of all users in the system.
// We'll create 25 users to simulate a larger pool for matching.
export const allUsers: User[] = Array.from({ length: 25 }, (_, i) => {
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const year = 1994 + (i % 7); // Ages will be around the current user's age
    const month = (i % 12) + 1;
    const day = (i % 28) + 1;
    const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return {
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        avatar: `https://picsum.photos/seed/user${i + 1}/200`,
        dob: dob,
        gender: gender,
        phone: `${i+1}000000000`,
        persona: `This is the unique persona for User ${i + 1}. They have interests that may or may not align with the current user. They are of the ${gender} gender and their age is ${getAge(dob)}.`,
        interestedInMeetups: (i % 3 !== 0), // About 2/3 of users are interested
        availableDates: [`2024-07-${20 + (i%5)}`, `2024-07-${27 + (i%2)}`] // Example weekend availability
    };
});


export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

export const dailySummaries: DailySummary[] = [];
