
import type { LucideIcon } from "lucide-react";

export type TribePreferences = {
  ageRange: [number, number];
  gender: "No Preference" | "Same Gender" | "Mixed Gender";
};

export type User = {
  id: string;
  name: string;
  avatar: string;
  persona?: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  journalEntries?: string[];
  email?: string | null;
  phone?: string;
  interestedInMeetups?: boolean;
  availableDates?: string[]; // YYYY-MM-DD
  personaLastGenerated?: string; // ISO date string
  hobbies?: string[];
  interests?: string[];
  mbti?: string;
  profession?: string;
  religion?: string;
  location?: string;
  tribePreferences?: TribePreferences;
  lastActive?: string; // ISO date string
  lastTribeDate?: string; // ISO date string
  is_sample_user?: boolean;
  is_admin?: boolean;
};

export type Connection = {
  id: string;
  userId: string;
  status: 'pending' | 'accepted';
};

export type Message = {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

export type Reminder = {
    id?: string;
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
    details?: string;
}

export type DailySummary = {
    id: string; // Unique ID for each journal entry
    date: string; // ISO date string (YYYY-MM-DDTHH:MM:SSZ)
    title?: string; // New: Optional title for the entry
    summary?: string;
    mood?: '😊' | '😢' | '😠' | '😮' | '😐';
    image?: string; // New: Optional image URL
    collectionTag?: string; // New: Optional tag for grouping entries
    isAvailable?: boolean;
    hasMeetup?: boolean;
    meetupDetails?: {
      location: string;
      time: string;
      tribeId: string;
    }
};

export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
};

export type Checklist = {
  id?:string;
  title: string;
  date: string; // YYYY-MM-DD
  items: ChecklistItem[];
};

export type PastTribe = {
    id: string;
    meetupDate: string; // YYYY-MM-DD
    location: string;
    attendance: 'attended' | 'not attended';
};

export type DiscoveredTribe = {
    id: string;
    members: Pick<User, 'id' | 'name' | 'avatar' | 'dob' | 'gender' | 'location' | 'hobbies'>[];
    compatibilityScore: number;
    commonHobbies: string[];
    averageAge: number;
    meetupDate: string; // Add meetupDate here
};

export type MatchedUser = {
  userId: string;
  user: User;
  compatibilityScore: number;
  persona: string;
  matchReason: string;
  rsvpStatus: 'accepted' | 'rejected' | 'pending';
  rejectionReason?: string;
};

export type Tribe = {
    id: string;
    members: MatchedUser[];
    meetupDate: string;
    meetupTime?: string;
    location: string;
    is_active: boolean;
    overallCompatibilityScore?: number;
}
