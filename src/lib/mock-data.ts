
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
  personaLastGenerated: undefined,
};

const samplePersonas = [
  "A thoughtful and analytical software engineer who finds joy in logical problem-solving and the tranquility of nature. They recharge by hiking and listening to indie music, balancing a structured life with a deep appreciation for creative expression and quiet moments.",
  "An energetic and optimistic graphic designer who thrives on social interaction and creative collaboration. Their passions include urban exploration, finding hidden cafes, and channeling their creativity into vibrant digital art. They are always eager for the next adventure.",
  "A compassionate and dedicated nurse who finds solace in the pages of historical fiction and the methodical process of gardening. They are a great listener, deeply value meaningful connections, and enjoy quiet evenings at home with a good book.",
  "A pragmatic and ambitious financial analyst who stays grounded through a disciplined morning routine of running and meditation. They are a strategic thinker, driven by goals, but also cherish deep conversations about philosophy and life's bigger questions.",
  "A free-spirited musician and artist who finds inspiration in travel, surrealist art, and late-night conversations. They are spontaneous and expressive, always seeking new experiences and ways to translate their feelings into music and paintings.",
  "An introverted and curious writer who spends their days crafting stories and their evenings exploring vintage bookstores. They have a passion for classic films, rainy days, and believe the best conversations happen over a warm cup of tea.",
  "A driven and adventurous architect who loves structure and design in their professional life but seeks thrills in their personal time through rock climbing and mountain biking. They are confident, a natural leader, and appreciate intellectually stimulating company.",
  "A warm and nurturing elementary school teacher who loves baking, crafting, and organizing community events. They are patient, empathetic, and find immense joy in helping others grow. Their ideal weekend involves a farmers' market and a cozy movie night.",
  "A tech-savvy and witty marketing specialist who is always up-to-date with the latest trends. They enjoy strategy board games, witty banter, and exploring new restaurants. They are highly social but value a small circle of close, trusted friends.",
  "A calm and observant marine biologist who feels most at home by the ocean. Their passions include scuba diving, environmental conservation, and documentary photography. They are introspective and prefer deep, one-on-one connections over large groups.",
  "An old-soul historian with a love for jazz music, black-and-white photography, and philosophical debates. They are intellectually curious, a bit romantic, and enjoy long walks through historic city streets while pondering the past.",
  "A minimalist and mindful yoga instructor who values experiences over possessions. They start each day with meditation and find peace in nature, healthy cooking, and journaling. They are calm, centered, and radiate a peaceful energy.",
  "A bold and charismatic entrepreneur who is constantly brainstorming new ideas. They thrive on challenges, networking, and high-energy activities like HIIT workouts. They are a natural motivator and love to inspire others to pursue their passions.",
  "A gentle and creative soul who works as a florist and loves bringing beauty into the world. Their hobbies include watercolor painting, poetry, and caring for their many houseplants. They are sensitive, romantic, and deeply connected to their emotions.",
  "A sharp and analytical lawyer who unwinds by playing chess and listening to classical music. They are disciplined and logical, but have a hidden passion for stand-up comedy and a dry sense of humor that surprises people.",
  "An adventurous and worldly travel blogger who is always planning their next trip. They are adaptable, open-minded, and love learning about new cultures through food and language. They believe life's greatest lessons are learned on the road.",
  "A methodical and patient craftsman who specializes in woodworking. They find satisfaction in creating things with their hands and enjoy the simple pleasures of life, like a good cup of coffee, the smell of sawdust, and the company of a loyal dog.",
  "A bubbly and outgoing veterinarian who has a deep love for all animals. They are optimistic, caring, and spend their free time volunteering at animal shelters and hiking with their own rescue pets. They have a contagious laugh and a positive outlook on life.",
  "A logical and forward-thinking data scientist who is fascinated by patterns and future technologies. They enjoy sci-fi novels, building complex Lego sets, and engaging in deep discussions about AI ethics. They are intellectually driven and value precision.",
  "A compassionate and insightful therapist who is skilled at listening and understanding others. They recharge with quiet activities like knitting, listening to ambient music, and practicing mindfulness. They are a safe space for their friends, offering wisdom and support.",
  "A competitive and disciplined athlete who trains rigorously but also has a soft spot for animated movies and cuddling with their cat. They are focused and determined, yet deeply loyal and protective of their loved ones.",
  "A quirky and imaginative fantasy author who lives partly in the worlds they create. They enjoy Dungeons & Dragons, collecting rare books, and believe a little bit of magic exists in everyday life. They are creative and have a unique perspective on things.",
  "A practical and resourceful homesteader who finds joy in self-sufficiency. They love gardening, canning, and learning traditional skills. They are down-to-earth, hardworking, and deeply connected to the cycles of nature.",
  "A sophisticated and cultured art curator with a keen eye for detail. They enjoy visiting galleries, attending the opera, and hosting elegant dinner parties. They are eloquent, polished, and appreciate the finer things in life.",
  "A playful and innovative video game developer who sees life as a series of interesting puzzles. They are a team player who enjoys collaborative projects, LAN parties, and experimenting with new game mechanics. They are fun-loving and endlessly creative."
];

// This represents our "database" of all users in the system.
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
        persona: samplePersonas[i],
        interestedInMeetups: (i % 3 !== 0), // About 2/3 of users are interested
        availableDates: [`2024-07-${20 + (i%5)}`, `2024-07-${27 + (i%2)}`], // Example weekend availability
        personaLastGenerated: undefined,
    };
});


export let reminders: Reminder[] = [];

export let checklists: Checklist[] = [];

export const dailySummaries: DailySummary[] = [];
