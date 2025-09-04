
import type { User, DailySummary, Reminder, Checklist, PastTribe, DiscoveredTribe } from './types';
import { subYears, format } from 'date-fns';

// The user who is currently logged in.
// Initially, it's a new user. After "login" or onboarding, this object will be updated.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: '',
  dob: '',
  gender: 'Prefer not to say',
  journalEntries: [],
  phone: '',
  persona: undefined,
  interestedInMeetups: false,
  personaLastGenerated: undefined,
  hobbies: [],
  interests: [],
  profession: undefined,
  religion: undefined,
  location: undefined,
  tribePreferences: undefined,
};

// This represents our "database" of all users in the system.
// It will be populated as new users sign up.
export const allUsers: User[] = [];

// Reminders for the current user, initially empty.
export let reminders: Reminder[] = [];

// Checklists for the current user, initially empty.
export let checklists: Checklist[] = [];

// Daily summaries for the current user, initially empty.
export const dailySummaries: DailySummary[] = [];

// Past tribe meetups for the current user, initially empty.
export const pastTribes: PastTribe[] = [];

// Mock data for discoverable tribes
export const discoveredTribes: DiscoveredTribe[] = [
    {
        id: 'DT-001',
        members: [
            { id: 'user-101', name: 'Alex', avatar: 'https://picsum.photos/seed/man1/200/200', dob: '1990-05-15', gender: 'Male', location: 'New York' },
            { id: 'user-102', name: 'Ben', avatar: 'https://picsum.photos/seed/man2/200/200', dob: '1988-09-20', gender: 'Male', location: 'New York' },
            { id: 'user-103', name: 'Charles', avatar: 'https://picsum.photos/seed/man3/200/200', dob: '1992-02-10', gender: 'Male', location: 'Brooklyn' },
        ],
        compatibilityScore: 88,
    },
    {
        id: 'DT-002',
        members: [
            { id: 'user-201', name: 'Diana', avatar: 'https://picsum.photos/seed/woman1/200/200', dob: '1995-11-30', gender: 'Female', location: 'London' },
            { id: 'user-202', name: 'Eve', avatar: 'https://picsum.photos/seed/woman2/200/200', dob: '1993-07-22', gender: 'Female', location: 'London' },
            { id: 'user-203', name: 'Fiona', avatar: 'https://picsum.photos/seed/woman3/200/200', dob: '1996-01-05', gender: 'Female', location: 'London' },
            { id: 'user-204', name: 'Grace', avatar: 'https://picsum.photos/seed/woman4/200/200', dob: '1994-04-18', gender: 'Female', location: 'London' },
            { id: 'user-205', name: 'Hannah', avatar: 'https://picsum.photos/seed/woman5/200/200', dob: '1995-03-12', gender: 'Female', location: 'Manchester' },
        ],
        compatibilityScore: 92,
    },
    {
        id: 'DT-003',
        members: [
            { id: 'user-301', name: 'Ian', avatar: 'https://picsum.photos/seed/man4/200/200', dob: '1985-06-25', gender: 'Male', location: 'Paris' },
            { id: 'user-302', name: 'Jane', avatar: 'https://picsum.photos/seed/woman6/200/200', dob: '1987-08-14', gender: 'Female', location: 'Paris' },
            { id: 'user-303', name: 'Kyle', avatar: 'https://picsum.photos/seed/man5/200/200', dob: '1986-10-01', gender: 'Male', location: 'Lyon' },
            { id: 'user-304', name: 'Laura', avatar: 'https://picsum.photos/seed/woman7/200/200', dob: '1988-12-09', gender: 'Female', location: 'Paris' },
        ],
        compatibilityScore: 76,
    },
     {
        id: 'DT-004',
        members: [
            { id: 'user-401', name: 'Mike', avatar: 'https://picsum.photos/seed/man6/200/200', dob: '2000-02-29', gender: 'Male', location: 'Tokyo' },
            { id: 'user-402', name: 'Nora', avatar: 'https://picsum.photos/seed/woman8/200/200', dob: '2001-04-03', gender: 'Female' },
        ],
        compatibilityScore: 95,
    }
];
