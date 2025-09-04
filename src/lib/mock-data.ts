
import type { User, DailySummary, Reminder, Checklist, PastTribe, DiscoveredTribe } from './types';

// The user who is currently logged in.
// This object is updated with live data from Firestore upon login.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: '',
  dob: '',
  gender: 'Prefer not to say',
  journalEntries: [],
  email: '',
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

// DEPRECATED MOCK DATA - These are no longer the source of truth
// and will be removed once all components are refactored.
export let reminders: Reminder[] = [];
export let checklists: Checklist[] = [];
export const dailySummaries: DailySummary[] = [];

// Past tribe meetups for the current user, initially empty.
export const pastTribes: PastTribe[] = [];

// Mock data for discoverable tribes
export const discoveredTribes: DiscoveredTribe[] = [];
