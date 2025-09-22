"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JournalChat } from "@/components/journal-chat";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { upsertManualJournalEntry, getJournalEntryForDate } from "@/services/journal-service";
import { format } from "date-fns";
import type { DailySummary } from "@/lib/types";
import { useRouter } from "next/navigation";

const MOOD_EMOJIS: DailySummary['mood'][] = ['😊', '😢', '😠', '😮', '😐'];

const JOURNAL_IDEAS = [
  "What was the most challenging part of your day, and how did you overcome it?",
  "What are you grateful for today? List three specific things.",
  "Describe a moment today that made you smile or laugh.",
  "If you could change one thing about your day, what would it be and why?",
  "What did you learn today, big or small?",
  "How did you practice self-care today?",
  "What emotions did you feel most strongly today, and what triggered them?",
  "Write about a conversation you had today that impacted you.",
  "What is something you're looking forward to tomorrow?",
  "Describe a success you had today, no matter how minor.",
  "What challenges did you face today, and how did you respond?",
  "Reflect on a decision you made today. Are you happy with it?",
  "What kind of energy did you bring into your day?",
  "Did you help anyone today, or did someone help you? Describe the interaction.",
  "What song best describes your mood today? Why?",
  "If your day had a theme song, what would it be?",
  "What was the most beautiful thing you saw today?",
  "What did you observe about yourself today?",
  "What habit are you trying to build or break, and how did today go with that?",
  "Write about something that surprised you today.",
  "What would you tell your past self about today?",
  "What would you tell your future self about today?",
  "If your day was a color, what color would it be and why?",
  "What did you do today that pushed you out of your comfort zone?",
  "What is one thing you wish you had done differently today?",
  "How did you contribute to someone else's happiness today?",
  "What did you consume today (food, media, information) that made you feel good?",
  "What felt authentic about your actions today?",
  "What felt draining today, and what felt energizing?",
  "Write about a place you visited or spent time in today.",
  "What did you notice about nature today?",
  "How did your body feel today? Any tensions or comforts?",
  "What thought kept coming back to you throughout the day?",
  "What are you tolerating right now?",
  "What boundaries did you set or wish you had set today?",
  "What's one small victory you had today?",
  "What act of kindness did you witness or perform?",
  "How did you express your creativity today?",
  "What is a current worry you have, and how did it manifest today?",
  "What part of your day would you like to relive?",
  "What are you proud of today?",
  "What are you releasing from today?",
  "What lesson did the universe try to teach you today?",
  "Describe your ideal tomorrow based on today's experiences.",
  "What did you do for fun today?",
  "How did you connect with others today?",
  "What thoughts or feelings are you holding onto that you want to let go of?",
  "What three words best describe your day?",
  "What did you do today that aligned with your values?",
  "What is something new you tried or experienced today?",
  "How did you use your strengths today?",
  "What did you accomplish today that you didn't think you would?",
  "Write about a simple pleasure you enjoyed today.",
  "What did you notice about your breathing today?",
  "If you could have a conversation with anyone about your day, who would it be?",
  "What's one thing you want to remember about today?",
  "How did you listen to your intuition today?",
  "What challenges are you currently navigating, and how did today fit into that?",
  "What are you looking forward to doing in the next week?",
  "Write about a dream you had last night or a daydream you had today.",
  "What did you create or contribute to today?",
  "How did you show up for yourself today?",
  "What did you learn from a mistake today?",
  "What are you currently unlearning?",
  "What brought you peace today?",
  "What sparked your curiosity today?",
  "How did you manage your energy levels today?",
  "What's a nagging thought you have, and how can you address it?",
  "What did you resist today, and why?",
  "How did your environment affect your mood today?",
  "What qualities did you embody today?",
  "Write about a moment of stillness or calm you experienced.",
  "What are you seeking more of in your daily life?",
  "How did you honor your needs today?",
  "What message do you need to hear right now?",
  "What did you procrastinate on, and how did that feel?",
  "What truth did you speak today, even if it was difficult?",
  "What did you choose to let go of today?",
  "How did you move your body today?",
  "What is a fear you faced today?",
  "What makes you feel alive? Did you experience it today?",
  "What small details made a difference in your day?",
  "How did you nourish your mind, body, and soul today?",
  "What are you releasing control over?",
  "What did you choose to focus on today?",
  "What did you appreciate about your home or workspace today?",
  "How did you contribute to a positive atmosphere today?",
  "What inspired you today?",
  "What are you intentionally creating in your life?",
  "Write about a moment of genuine connection.",
  "What are you feeling called to do next?",
  "How did you express gratitude to someone today?",
  "What is a goal you're working towards, and what step did you take today?",
  "What did you do today just for the joy of it?",
  "What self-limiting belief did you encounter today?",
  "How did you embrace imperfection today?",
  "What wisdom did you gain from a challenge?",
  "What do you need to forgive yourself for regarding today?",
  "What did you allow yourself to receive today?",
  "How did you listen to your inner voice today?",
  "What is one thing you could do differently tomorrow to improve your day?",
  "What are you celebrating about today?"
];

export default function JournalPage() {
  const [isAssistiveMode, setIsAssistiveMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('journalMode');
      return savedMode ? JSON.parse(savedMode) : true;
    }
    return true;
  });
  const [manualEntry, setManualEntry] = useState("");
  const [todayEntry, setTodayEntry] = useState<DailySummary | null>(null); 
  const [selectedMood, setSelectedMood] = useState<DailySummary['mood'] | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [displayedIdeas, setDisplayedIdeas] = useState<string[]>([]);
  const [cardDescription, setCardDescription] = useState("Engage in a conversation to explore your thoughts and feelings.");
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');
  const router = useRouter();

  const shuffleIdeas = () => {
    const shuffled = JOURNAL_IDEAS.sort(() => 0.5 - Math.random());
    setDisplayedIdeas(shuffled.slice(0, 3));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('journalMode', JSON.stringify(isAssistiveMode));
    }
  }, [isAssistiveMode]);

  useEffect(() => {
    if (!isAssistiveMode) {
      setCardDescription("Journaling is a mindfulness practice. It helps you clear your thoughts and encourages daily reflection.");
      if (user) {
        fetchTodayEntry();
        shuffleIdeas();
      }
    } else {
      setCardDescription("Engage in a conversation to explore your thoughts and feelings.");
      setManualEntry("");
      setTodayEntry(null);
      setSelectedMood(undefined);
      setIsEditing(false);
      setDisplayedIdeas([]);
    }
  }, [isAssistiveMode, user]);

  const fetchTodayEntry = async () => {
    if (user) {
      try {
        const entry = await getJournalEntryForDate(user.uid, today);
        if (entry) {
          setTodayEntry(entry);
          setManualEntry(entry.summary || "");
          setSelectedMood(entry.mood || undefined);
          setIsEditing(false);
        } else {
          setTodayEntry(null);
          setManualEntry("");
          setSelectedMood(undefined);
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error fetching today's journal entry:", error);
        setTodayEntry(null);
        setManualEntry("");
        setSelectedMood(undefined);
        setIsEditing(true);
      }
    }
  };

  const handleSaveManualEntry = async () => {
    if (user && manualEntry.trim()) {
      try {
        await upsertManualJournalEntry(user.uid, today, manualEntry, selectedMood);
        await fetchTodayEntry(); 
        setManualEntry("");
        setIsEditing(false);
      } catch (error) {
        console.error("Error saving manual journal entry:", error);
      }
    }
  };

  const handleEditEntry = () => {
    setManualEntry(todayEntry?.summary || "");
    setSelectedMood(todayEntry?.mood || undefined);
    setIsEditing(true);
  };

  return (
    <Card className="h-full w-full flex flex-col">
        <CardHeader className="relative">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>My Journal</CardTitle>
                    <CardDescription>{cardDescription}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={() => router.push('/journal/history')}
                        className="mr-2"
                    >
                        Journal Entries
                    </Button>
                    <Label htmlFor="journal-mode-switch">Manual</Label>
                    <Switch
                        id="journal-mode-switch"
                        checked={isAssistiveMode}
                        onCheckedChange={setIsAssistiveMode}
                    />
                    <Label htmlFor="journal-mode-switch">Assistive</Label>
                </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex flex-col">
            {isAssistiveMode ? (
                <JournalChat />
            ) : (
                <div className="flex flex-col h-full p-4">
                    {(isEditing || !todayEntry) ? (
                        <>
                            <Textarea
                                placeholder="Write your journal entry here..."
                                className="flex-1 mb-4"
                                value={manualEntry}
                                onChange={(e) => setManualEntry(e.target.value)}
                            />
                            <div className="mb-4 flex gap-2 justify-end">
                                {MOOD_EMOJIS.map((mood) => (
                                    <Button
                                        key={mood}
                                        variant={selectedMood === mood ? "default" : "outline"}
                                        size="icon"
                                        onClick={() => setSelectedMood(mood)}
                                        className="text-xl"
                                    >
                                        {mood}
                                    </Button>
                                ))}
                            </div>
                            <Button onClick={handleSaveManualEntry} className="self-end mb-4">Save Entry</Button>
                            <div className="bg-accent p-4 rounded-md mt-4">
                                <h3 className="text-lg font-semibold mb-2">Journaling Ideas:</h3>
                                <ul className="list-disc list-inside text-sm text-muted-foreground max-h-48 overflow-y-auto">
                                    {displayedIdeas.map((idea, index) => (
                                        <li key={index} className="mb-1">{idea}</li>
                                    ))}
                                </ul>
                                <Button onClick={shuffleIdeas} className="mt-2 w-full">Shuffle Ideas</Button>
                            </div>
                        </>
                    ) : (
                        <Card className="p-4 flex flex-col items-center text-center max-h-[calc(100vh-200px)] overflow-y-auto"> {/* Removed h-full and justify-center, added max-h and overflow */}
                            <CardTitle className="mb-2">{format(new Date(todayEntry.date), "EEEE, MMMM d, yyyy")}</CardTitle>
                            {todayEntry?.mood && <p className="text-5xl mb-4">{todayEntry.mood}</p>}
                            <p className="whitespace-pre-wrap mb-4">{todayEntry?.summary}</p> {/* Removed flex-1 */}
                            <p className="text-sm text-muted-foreground mb-4">Congratulations! You took a small step towards mindfulness today.</p>
                            <Button onClick={handleEditEntry} className="mt-2">Edit Entry</Button> {/* Removed self-end, added mt-2 */}
                        </Card>
                    )}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
