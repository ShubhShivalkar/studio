
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
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  journalEntries?: string[];
  phone: string;
  interestedInMeetups?: boolean;
  availableDates?: string[]; // YYY-MM-DD
  personaLastGenerated?: string; // ISO date string
  hobbies?: string[];
  interests?: string[];
  profession?: string;
  religion?: string;
  location?: string;
  tribePreferences?: TribePreferences;
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
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
    details?: string;
}

export type DailySummary = {
    date: string; // YYYY-MM-DD
    summary?: string;
    mood?: '😊' | '😢' | '😠' | '😮' | '😐';
    hobbies?: { icon: LucideIcon, name: string }[];
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
  id:string;
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
