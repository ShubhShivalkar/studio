
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
  journalEntries: [
    "Today was a really peaceful day. I spent the afternoon reading in the park and it felt so good to just disconnect.",
    "I tried a new recipe for dinner tonight - a spicy lentil soup. It turned out surprisingly well! I love the feeling of creating something delicious from scratch.",
    "Feeling a bit stressed about the upcoming project deadline at work. Trying to remind myself to take it one step at a time.",
    "Had a great video call with an old friend from college. It's amazing how we can just pick up right where we left off, even after months apart.",
    "I went for a long walk by the river this morning. The sunrise was absolutely beautiful and it put me in a great mood for the rest of the day.",
    "I've been thinking a lot about learning a new skill. Maybe I'll finally sign up for that pottery class I've been eyeing.",
    "Watched a fascinating documentary about marine life. It's incredible how much there is to learn about our planet.",
    "Felt a little lonely today. Sometimes it's hard living in a big city. Decided to journal about it to process my feelings.",
    "I accomplished a small goal today: organizing my bookshelf. It's a tiny thing, but it makes my space feel so much more orderly and calm.",
    "Listened to a new album that I really enjoyed. Music has such a powerful way of shifting my mood and perspective.",
    "I'm feeling grateful for my family today. Had a short but sweet call with my parents and it just made my heart full.",
    "Spent some time sketching this evening. I'm not a great artist, but I find the process of drawing to be incredibly meditative.",
    "I'm planning a weekend trip to go hiking next month. Just the thought of being surrounded by nature is making me excited.",
    "Reflecting on some of my personal goals. I feel like I'm making slow but steady progress, and that's something to be proud of.",
    "Today was a simple day, but a good one. Sometimes those are the best kind. Just enjoying the quiet moments."
  ],
  phone: '',
  persona: 'A thoughtful and introspective individual who finds joy in simple pleasures like reading in the park and trying new recipes. They are a creative person who enjoys sketching and listening to music to relax. While they value their quiet time, they also cherish deep connections with friends and family. They are goal-oriented and reflective, always looking for ways to learn and grow, such as taking up a new hobby like pottery.',
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
