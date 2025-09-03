import { BookOpen, Brush, Mountain } from 'lucide-react';
import type { User, Connection, DailySummary, Reminder, Checklist } from './types';

export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: '',
  dob: '',
  gender: 'Prefer not to say',
  journalEntries: [],
};

export const otherUsers: User[] = [
  {
    id: 'user-1',
    name: 'Samira Khan',
    avatar: 'https://picsum.photos/seed/samira/200/200',
    dob: '1992-04-22',
    gender: 'Female',
    persona: 'A creative and empathetic soul with a love for art and nature. They are a thoughtful observer of the world, finding beauty in the small details and expressing themselves through various creative outlets. Deeply value meaningful connections.',
  },
  {
    id: 'user-2',
    name: 'Ben Carter',
    avatar: 'https://picsum.photos/seed/ben/200/200',
    dob: '1988-11-30',
    gender: 'Male',
    persona: 'An adventurous and optimistic individual who thrives on new experiences. They are driven by curiosity and a desire to explore the world. Possesses a resilient spirit and a knack for finding the silver lining in any situation.',
  },
  {
    id: 'user-3',
    name: 'Chloe Garcia',
    avatar: 'https://picsum.photos/seed/chloe/200/200',
    dob: '1998-07-12',
    gender: 'Female',
    persona: 'A logical and ambitious thinker with a passion for problem-solving. They are highly organized and driven to achieve their goals. Enjoys intellectual challenges and engaging in deep, analytical conversations.',
  },
  {
    id: 'user-4',
    name: 'Leo Maxwell',
    avatar: 'https://picsum.photos/seed/leo/200/200',
    dob: '1994-02-05',
    gender: 'Male',
    persona: 'A calm and grounded presence, who values stability and harmony. They are a loyal friend and a good listener, often providing a sense of comfort to those around them. Finds joy in simple pleasures and a well-balanced life.',
  },
  {
    id: 'user-5',
    name: 'Mia Chen',
    avatar: 'https://picsum.photos/seed/mia/200/200',
    dob: '2000-09-18',
    gender: 'Female',
    persona: 'A vibrant and energetic spirit with a contagious zest for life. They are sociable and outgoing, effortlessly making connections with others. Thrives in dynamic environments and is always open to new ideas and perspectives.',
  },
  {
    id: 'user-6',
    name: 'Jordan Smith',
    avatar: 'https://picsum.photos/seed/jordan/200/200',
    dob: '1996-06-01',
    gender: 'Other',
    persona: 'An introspective and philosophical individual who is always seeking to understand the deeper meaning of things. They are highly intuitive and value authenticity above all else. Often lost in thought, they possess a rich inner world.',
  },
];

export const connections: Connection[] = [
    { id: 'conn-1', userId: 'user-1', status: 'accepted' },
    { id: 'conn-2', userId: 'user-3', status: 'accepted' },
    { id: 'conn-3', userId: 'user-4', status: 'pending' },
];

export const requests: Connection[] = [
    { id: 'conn-5', userId: 'user-5', status: 'pending' },
]

export const matchedUsers = [
    {
        userId: 'user-2',
        compatibilityScore: 92,
        persona: 'An adventurous and optimistic individual who thrives on new experiences. They are driven by curiosity and a desire to explore the world. Possesses a resilient spirit and a knack for finding the silver lining in any situation.',
    },
    {
        userId: 'user-6',
        compatibilityScore: 88,
        persona: 'An introspective and philosophical individual who is always seeking to understand the deeper meaning of things. They are highly intuitive and value authenticity above all else. Often lost in thought, they possess a rich inner world.',
    },
    {
        userId: 'user-1',
        compatibilityScore: 85,
        persona: 'A creative and empathetic soul with a love for art and nature. They are a thoughtful observer of the world, finding beauty in the small details and expressing themselves through various creative outlets. Deeply value meaningful connections.',
    }
]

export let reminders: Reminder[] = [
    {
        id: 'rem-1',
        date: '2024-07-15',
        time: '10:00',
        title: 'Doctor Appointment',
        details: 'Annual check-up with Dr. Smith.'
    }
];

export let checklists: Checklist[] = [
    {
        id: 'cl-1',
        date: '2024-07-22',
        title: 'Project Phoenix Tasks',
        items: [
            { id: 'item-1-1', text: 'Finalize design mockups', completed: true },
            { id: 'item-1-2', text: 'Develop login page', completed: true },
            { id: 'item-1-3', text: 'Integrate API endpoints', completed: false },
        ]
    }
];

export const dailySummaries: DailySummary[] = [
    {
        date: '2024-07-15',
        summary: 'Felt accomplished after finishing a major project. Took a calming walk in the evening.',
        mood: '😊',
        hobbies: [{ icon: Mountain, name: 'Hiking' }],
        isAvailable: true,
        hasMeetup: false,
    },
    {
        date: '2024-07-22',
        summary: 'Introspective day thinking about future goals. Reading philosophy was insightful.',
        mood: '😐',
        hobbies: [{ icon: BookOpen, name: 'Reading' }],
        isAvailable: false,
        hasMeetup: false,
    },
    {
        date: '2024-07-28',
        summary: 'Had a wonderful time with friends over dinner. Laughter and connection felt great.',
        mood: '😊',
        hobbies: [],
        isAvailable: false,
        hasMeetup: true,
    },
     {
        date: '2024-08-05',
        summary: 'Started a new painting today. Felt very creative and in the flow.',
        mood: '😊',
        hobbies: [{ icon: Brush, name: 'Painting' }],
        isAvailable: true,
        hasMeetup: false,
    },
];
