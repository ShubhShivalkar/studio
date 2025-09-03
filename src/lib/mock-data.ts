
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
  dob: '1999-07-15', // Set to be 25 years old in 2024
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
  personaLastGenerated: undefined,
};

const samplePersonas = [
  // This persona is designed to be a strong match for the currentUser.
  "A thoughtful and analytical software engineer who finds joy in logical problem-solving and the tranquility of nature. They recharge by hiking and listening to interesting podcasts, balancing a structured life with a deep appreciation for creative expression like sketching and cooking.",
  // This persona is also designed to be a strong match.
  "A compassionate and dedicated writer who finds solace in the pages of fantasy novels and the methodical process of trying new recipes. They are a great listener, deeply value meaningful connections, and enjoy quiet evenings at home with a good book or documentary.",
  // Strong match: Creative, enjoys learning, introspective.
  "A free-spirited musician and artist who finds inspiration in travel, surrealist art, and late-night conversations. They are spontaneous and expressive, always seeking new experiences and learning new skills, like a new language, to broaden their horizons.",
  // Strong match: Introverted, enjoys reading and quiet activities.
  "An introverted and curious writer who spends their days crafting stories and their evenings exploring vintage bookstores. They have a passion for classic films, rainy days, and believe the best conversations happen over a warm cup of tea.",
  // Strong match: Values mindfulness and quiet reflection.
  "A minimalist and mindful yoga instructor who values experiences over possessions. They start each day with meditation and find peace in nature, healthy cooking, and journaling. They are calm, centered, and radiate a peaceful energy.",
  // Strong match: Intellectually driven, enjoys coding/building.
  "A logical and forward-thinking data scientist who is fascinated by patterns and future technologies. They enjoy sci-fi novels, building complex personal projects, and engaging in deep discussions about AI ethics. They are intellectually driven and value precision.",
];

const generateWeekendDatesForMonth = (year: number, month: number) => {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day); // month is 1-based
        if (date.getDay() === 0 || date.getDay() === 6) { // 0 is Sunday, 6 is Saturday
            dates.push(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
        }
    }
    return dates;
};

const weekendDates = generateWeekendDatesForMonth(2025, 9); // September 2025


// This represents our "database" of all users in the system.
export const allUsers: User[] = Array.from({ length: 6 }, (_, i) => {
    const gender = (i % 2 === 0) ? 'Male' : 'Female';
    // Generates birth years for ages 24-26 in 2024 (1998, 1999, 2000)
    const year = 1998 + (i % 3); 
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
        persona: samplePersonas[i],
        interestedInMeetups: true, 
        availableDates: weekendDates,
        personaLastGenerated: undefined,
    };
});


export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

// Pre-populate with available weekends for the current user for testing purposes
export const dailySummaries: DailySummary[] = [];

// Dynamically add availability for the current month's weekends for the currentUser
const currentMonthWeekendDates = generateWeekendDatesForMonth(new Date().getFullYear(), new Date().getMonth() + 1);
currentMonthWeekendDates.forEach(dateStr => {
    dailySummaries.push({ date: dateStr, isAvailable: true });
});
