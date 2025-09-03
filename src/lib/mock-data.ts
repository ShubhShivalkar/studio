import type { User, Connection, DailySummary, Reminder, Checklist } from './types';

// The user who is currently logged in.
// Initially, it's a new user. After "login", this object will be updated.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: '',
  dob: '',
  gender: 'Prefer not to say',
  journalEntries: [],
  phone: '',
};

// This represents our "database" of all users in the system.
// In a real app, this would be a database.
export const allUsers: User[] = [];

// Re-export otherUsers for compatibility with existing code that uses it.
export const otherUsers = allUsers.filter(u => u.id !== currentUser.id);

export const connections: Connection[] = [];

export const requests: Connection[] = [];

export const matchedUsers: { userId: string; compatibilityScore: number; persona: string; }[] = [];

export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

export const dailySummaries: DailySummary[] = [];
