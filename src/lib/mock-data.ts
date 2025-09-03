import type { User, Connection, DailySummary, Reminder, Checklist } from './types';

// The user who is currently logged in.
// Initially, it's a new user. After "login", this object will be updated.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: 'https://picsum.photos/seed/anewuser/200',
  dob: '',
  gender: 'Prefer not to say',
  journalEntries: [],
  phone: '',
  persona: "A thoughtful and introspective individual with a passion for creative writing and a love for quiet mornings. They are curious about the world, enjoy deep conversations, and find joy in simple pleasures like a good book or a walk in nature. They are on a journey of self-discovery and are always seeking to learn and grow."
};

// This represents our "database" of all users in the system.
// In a real app, this would be a database.
export const allUsers: User[] = [
    {
        id: 'user-1',
        name: 'Alex Rivera',
        avatar: 'https://picsum.photos/seed/alex/200',
        dob: '1995-08-12',
        gender: 'Male',
        phone: '1112223333',
        persona: "A driven and ambitious person who loves tackling challenges head-on. They're an avid hiker and rock climber, always looking for the next adventure. They value honesty and directness in communication and are deeply loyal to their friends."
    },
    {
        id: 'user-2',
        name: 'Samantha Chen',
        avatar: 'https://picsum.photos/seed/samantha/200',
        dob: '1998-03-25',
        gender: 'Female',
        phone: '4445556666',
        persona: "A compassionate and artistic soul with a talent for painting and a love for classic films. They are a great listener, incredibly empathetic, and have a calming presence. They cherish their close relationships and enjoy cozy nights in with good company."
    },
    {
        id: 'user-3',
        name: 'Ben Carter',
        avatar: 'https://picsum.photos/seed/ben/200',
        dob: '1993-11-30',
        gender: 'Male',
        phone: '7778889999',
        persona: "An energetic and optimistic individual with a great sense of humor. They play guitar in a band, love trying new foods, and are always the life of the party. They are spontaneous and live in the moment, bringing excitement wherever they go."
    },
    {
        id: 'user-4',
        name: 'Priya Sharma',
        avatar: 'https://picsum.photos/seed/priya/200',
        dob: '1996-06-18',
        gender: 'Female',
        phone: '1234567890',
        persona: "A highly organized and detail-oriented person who enjoys planning events and traveling the world. They are intellectually curious, an avid reader of non-fiction, and enjoy documentaries. They value structure and are always working towards their next big goal."
    }
];

// Re-export otherUsers for compatibility with existing code that uses it.
export const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

export const connections: Connection[] = [];

export const requests: Connection[] = [];

export const matchedUsers: { userId: string; compatibilityScore: number; persona: string; }[] = [];

export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

export const dailySummaries: DailySummary[] = [];
