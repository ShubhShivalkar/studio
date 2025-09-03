
import type { User, DailySummary, Reminder, Checklist, PastTribe } from './types';
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
};

// This represents our "database" of all users in the system.
// It will be populated as new users sign up.
export const allUsers: User[] = [
    {
        id: 'user-1',
        name: 'Alex Johnson',
        avatar: 'https://picsum.photos/seed/alex/200/200',
        dob: format(subYears(new Date(), 28), 'yyyy-MM-dd'),
        gender: 'Male',
        phone: '111-111-1111',
        persona: 'A creative and adventurous individual who finds joy in exploring new places and capturing moments through photography. Values deep conversations and authentic connections.',
        interestedInMeetups: true,
        hobbies: ['Photography', 'Hiking', 'Reading'],
        interests: ['Travel', 'Art', 'Documentaries'],
        profession: 'Graphic Designer',
        religion: 'Atheism/Agnosticism',
        location: 'New York',
    },
    {
        id: 'user-2',
        name: 'Brenda Smith',
        avatar: 'https://picsum.photos/seed/brenda/200/200',
        dob: format(subYears(new Date(), 32), 'yyyy-MM-dd'),
        gender: 'Female',
        phone: '222-222-2222',
        persona: 'A compassionate and thoughtful person who loves spending time in nature and practicing mindfulness. Enjoys cooking healthy meals and listening to calming music.',
        interestedInMeetups: true,
        hobbies: ['Yoga', 'Cooking', 'Gardening'],
        interests: ['Mindfulness', 'Health & Wellness', 'Podcasts'],
        profession: 'Yoga Instructor',
        religion: 'Buddhism',
        location: 'San Francisco',
    },
    {
        id: 'user-3',
        name: 'Carlos Gomez',
        avatar: 'https://picsum.photos/seed/carlos/200/200',
        dob: format(subYears(new Date(), 25), 'yyyy-MM-dd'),
        gender: 'Male',
        phone: '333-333-3333',
        persona: 'An energetic and ambitious individual who is passionate about technology and entrepreneurship. Loves solving complex problems and enjoys a good challenge.',
        interestedInMeetups: true,
        hobbies: ['Coding', 'Playing Guitar', 'Chess'],
        interests: ['Startups', 'Sci-Fi Movies', 'Jazz Music'],
        profession: 'Software Engineer',
        religion: 'Christianity',
        location: 'Austin',
    },
    {
        id: 'user-4',
        name: 'Diana Prince',
        avatar: 'https://picsum.photos/seed/diana/200/200',
        dob: format(subYears(new Date(), 30), 'yyyy-MM-dd'),
        gender: 'Female',
        phone: '444-444-4444',
        persona: 'A kind-hearted and social person who loves animals and is dedicated to community service. Enjoys volunteering and spending quality time with friends.',
        interestedInMeetups: true,
        hobbies: ['Volunteering', 'Baking', 'Dancing'],
        interests: ['Animal Rights', 'Comedy Shows', 'History'],
        profession: 'Veterinarian',
        religion: 'Judaism',
        location: 'Chicago',
    },
    {
        id: 'user-5',
        name: 'Ethan Hunt',
        avatar: 'https://picsum.photos/seed/ethan/200/200',
        dob: format(subYears(new Date(), 35), 'yyyy-MM-dd'),
        gender: 'Male',
        phone: '555-555-5555',
        persona: 'A disciplined and focused individual with a love for fitness and personal development. Believes in continuous learning and pushing personal limits.',
        interestedInMeetups: true,
        hobbies: ['Running', 'Weightlifting', 'Journaling'],
        interests: ['Stoicism', 'Biographies', 'Productivity'],
        profession: 'Personal Trainer',
        religion: 'Prefer not to say',
        location: 'Miami',
    },
    {
        id: 'user-6',
        name: 'Fiona Glenanne',
        avatar: 'https://picsum.photos/seed/fiona/200/200',
        dob: format(subYears(new Date(), 29), 'yyyy-MM-dd'),
        gender: 'Female',
        phone: '666-666-6666',
        persona: 'An artistic soul with a passion for literature and classic films. Enjoys quiet evenings, visiting museums, and writing poetry.',
        interestedInMeetups: true,
        hobbies: ['Writing', 'Painting', 'Film Photography'],
        interests: ['Classic Literature', 'Indie Films', 'Coffee Shops'],
        profession: 'Librarian',
        religion: 'Other',
        location: 'Boston',
    }
];

// Reminders for the current user, initially empty.
export let reminders: Reminder[] = [];

// Checklists for the current user, initially empty.
export let checklists: Checklist[] = [];

// Daily summaries for the current user, initially empty.
export const dailySummaries: DailySummary[] = [];

// Past tribe meetups for the current user, initially empty.
export const pastTribes: PastTribe[] = [];
