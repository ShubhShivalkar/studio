
import type { User, Connection, DailySummary, Reminder, Checklist, PastTribe } from './types';

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
