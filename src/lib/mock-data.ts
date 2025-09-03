
import type { User, Connection, DailySummary, Reminder, Checklist } from './types';
import { differenceInYears } from 'date-fns';

// Helper to calculate age
const getAge = (dob: string) => differenceInYears(new Date(), new Date(dob));


// The user who is currently logged in.
// Initially, it's a new user. After "login", this object will be updated.
export let currentUser: User = {
  id: 'user-0',
  name: 'New User',
  avatar: 'https://picsum.photos/seed/anewuser/200',
  dob: '1996-10-15', // Example DOB
  gender: 'Female',
  journalEntries: [
    "Felt a bit tired today, but pushed through my workout. Listened to a fascinating podcast about space exploration on my way home. It's amazing to think about what's out there.",
    "Spent the afternoon reading in the park. The weather was perfect. I'm really getting into this new fantasy novel; the world-building is incredible.",
    "Tried a new recipe for dinner - spicy lentil soup. It turned out surprisingly well! I love experimenting in the kitchen.",
    "Had a long video call with an old friend from college. It's so good to catch up and reminisce. We were laughing so hard about our past adventures.",
    "Feeling a little overwhelmed with work this week. Made a checklist to tackle my tasks one by one, which helped me feel more in control.",
    "Went for a long walk by the river. The quiet moments in nature are so restorative. It helps clear my head.",
    "Attended a pottery class tonight. It was so much fun to get my hands dirty and create something. My little bowl is a bit lopsided, but I love it.",
    "Feeling grateful for my family today. Had a simple dinner with them, and it was just what I needed. Their support means everything.",
    "Worked on a personal coding project. Finally fixed a bug that's been bothering me for days. The feeling of solving a complex problem is so satisfying.",
    "Watched a documentary about minimalist living. It's given me a lot to think about regarding what's truly important.",
    "A challenging day at work, but I learned a lot about resilience. Every challenge is an opportunity to grow.",
    "Spent the evening sketching. I'm not a great artist, but it's a relaxing way to express myself without words.",
    "Reflecting on my goals for the year. I'm proud of the progress I've made, and I'm excited about what's to come.",
    "Listened to a lot of classical music today while working. It helps me focus and feel calm.",
    "Had a really interesting conversation with a stranger at a coffee shop. It's amazing what you can learn from a brief encounter.",
    "Feeling very productive. I managed to cross off everything on my to-do list for the day. A small victory!",
    "Thinking about a trip I'd like to take soon. Maybe somewhere with mountains and hiking trails. The idea of an adventure is exciting.",
    "A quiet day, mostly spent at home. Sometimes it's nice to have no plans and just recharge.",
    "I'm learning a new language online. It's difficult but rewarding. Each new word I learn feels like a small accomplishment.",
    "Felt a wave of nostalgia looking through old photos. It's sweet to remember all the different chapters of life."
  ],
  phone: '',
  // Persona is initially undefined until generated
  persona: undefined,
  interestedInMeetups: false,
};

// This represents our "database" of all users in the system.
// We'll create 25 users to simulate a larger pool for matching.
export const allUsers: User[] = Array.from({ length: 25 }, (_, i) => {
    const gender = i % 2 === 0 ? 'Male' : 'Female';
    const year = 1994 + (i % 7); // Ages will be around the current user's age
    const month = (i % 12) + 1;
    const day = (i % 28) + 1;
    const dob = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return {
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        avatar: `https://picsum.photos/seed/user${i + 1}/200`,
        dob: dob,
        gender: gender,
        phone: `${i+1}000000000`,
        persona: `This is the unique persona for User ${i + 1}. They have interests that may or may not align with the current user. They are of the ${gender} gender and their age is ${getAge(dob)}.`,
        interestedInMeetups: (i % 3 !== 0), // About 2/3 of users are interested
        availableDates: [`2024-07-${20 + (i%5)}`, `2024-07-${27 + (i%2)}`] // Example weekend availability
    };
});


export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

export const dailySummaries: DailySummary[] = [];
