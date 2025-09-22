"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JournalChat } from "@/components/journal-chat";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { addManualJournalEntry, getJournalEntriesForDate, updateJournalEntry, deleteJournalEntry, getAllJournalEntries } from "@/services/journal-service";
import { format } from "date-fns";
import type { DailySummary } from "@/lib/types";
import { useRouter } from "next/navigation";
import { CalendarIcon, PenSquare, Trash2, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  "What song best describes your day? Why?",
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
  "What felt authentic today?",
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
  "Write about a dream you had last night or a daydream you had today?",
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
  "What did you embrace imperfection today?",
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
  const [entryTitle, setEntryTitle] = useState<string>("");
  const [entryImage, setEntryImage] = useState<string | null>(null); // New state for image URL
  const [collectionTag, setCollectionTag] = useState<string>("");
  const [todayEntries, setTodayEntries] = useState<DailySummary[]>([]); 
  const [selectedMood, setSelectedMood] = useState<DailySummary['mood'] | undefined>(undefined);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [displayedIdeas, setDisplayedIdeas] = useState<string[]>([]);
  const [cardDescription, setCardDescription] = useState("Engage in a conversation to explore your thoughts and feelings.");
  const [allCollectionTags, setAllCollectionTags] = useState<string[]>([]);
  const [newCollectionTagName, setNewCollectionTagName] = useState<string>("");
  const [isNewCollectionDialogOpen, setIsNewCollectionDialogOpen] = useState<boolean>(false);

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
        fetchTodayEntries();
        fetchAllCollectionTags();
        shuffleIdeas();
      }
    } else {
      setCardDescription("Engage in a conversation to explore your thoughts and feelings.");
      setManualEntry("");
      setEntryTitle("");
      setEntryImage(null);
      setCollectionTag("");
      setTodayEntries([]);
      setSelectedMood(undefined);
      setEditingEntryId(null);
      setDisplayedIdeas([]);
      setAllCollectionTags([]);
      setNewCollectionTagName("");
      setIsNewCollectionDialogOpen(false);
    }
  }, [isAssistiveMode, user]);

  const fetchTodayEntries = async () => {
    if (user) {
      try {
        const entries = await getJournalEntriesForDate(user.uid, today);
        setTodayEntries(entries);
      } catch (error) {
        console.error("Error fetching today's journal entries:", error);
        setTodayEntries([]);
      }
    }
  };

  const fetchAllCollectionTags = async () => {
    if (user) {
      try {
        const allEntries = await getAllJournalEntries(user.uid);
        const tags = new Set<string>();
        allEntries.forEach(entry => {
          if (entry.collectionTag) {
            tags.add(entry.collectionTag);
          }
        });
        setAllCollectionTags(Array.from(tags).sort());
      } catch (error) {
        console.error("Error fetching all collection tags:", error);
      }
    }
  };

  const handleSaveEntry = async () => {
    if (user && manualEntry.trim()) {
      try {
        if (editingEntryId) {
          await updateJournalEntry(editingEntryId, manualEntry, selectedMood, entryTitle, null, collectionTag);
        } else {
          await addManualJournalEntry(user.uid, new Date().toISOString(), manualEntry, selectedMood, entryTitle, null, collectionTag);
        }
        await fetchTodayEntries(); 
        setManualEntry("");
        setEntryTitle("");
        setEntryImage(null);
        setCollectionTag("");
        setSelectedMood(undefined);
        setEditingEntryId(null);
      } catch (error) {
        console.error("Error saving manual journal entry:", error);
      }
    }
  };

  const handleEditEntry = (entry: DailySummary) => {
    setManualEntry(entry.summary || "");
    setEntryTitle(entry.title || "");
    setEntryImage(entry.image || null);
    setCollectionTag(entry.collectionTag || "");
    setSelectedMood(entry.mood || undefined);
    setEditingEntryId(entry.id);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await deleteJournalEntry(entryId);
        await fetchTodayEntries();
        await fetchAllCollectionTags(); 
      } catch (error) {
        console.error("Error deleting journal entry:", error);
      }
    }
  };

  const handleAddNewCollection = () => {
    if (newCollectionTagName.trim() && !allCollectionTags.includes(newCollectionTagName.trim())) {
      setAllCollectionTags(prev => [...prev, newCollectionTagName.trim()].sort());
      setCollectionTag(newCollectionTagName.trim());
    }
    setNewCollectionTagName("");
    setIsNewCollectionDialogOpen(false);
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
                        className="mr-2 flex items-center gap-1"
                    >
                        <CalendarIcon className="h-4 w-4" /> Journal Entries
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
                <div className="flex flex-col h-full p-4 overflow-y-auto">
                    <div className="mb-6 p-4 border rounded-lg bg-background shadow-sm">
                        <h3 className="text-lg font-semibold mb-3">{editingEntryId ? "Edit Journal Entry" : "Add New Journal Entry"}</h3>
                        
                        <Input
                            placeholder="Title (Optional)"
                            className="mb-3"
                            value={entryTitle}
                            onChange={(e) => setEntryTitle(e.target.value)}
                        />
                        
                        <Textarea
                            placeholder="Write your journal entry here..."
                            className="flex-1 mb-4 min-h-[100px]"
                            value={manualEntry}
                            onChange={(e) => setManualEntry(e.target.value)}
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Label htmlFor="collection-tag-select">Collection:</Label>
                                <Select onValueChange={setCollectionTag} value={collectionTag}>
                                    <SelectTrigger id="collection-tag-select" className="w-[180px]">
                                        <SelectValue placeholder="Select a collection" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Existing Collections</SelectLabel>
                                            {allCollectionTags.length > 0 ? (
                                                allCollectionTags.map(tag => (
                                                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="no-collections" disabled>No collections yet</SelectItem>
                                            )}
                                        </SelectGroup>
                                        <AlertDialog open={isNewCollectionDialogOpen} onOpenChange={setIsNewCollectionDialogOpen}>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" className="w-full justify-start mt-1"><PlusCircle className="mr-2 h-4 w-4" /> Add New Collection</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Add New Collection Tag</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Enter a new tag to categorize your journal entries.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <Input
                                                    placeholder="New Collection Name"
                                                    value={newCollectionTagName}
                                                    onChange={(e) => setNewCollectionTagName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddNewCollection();
                                                        }
                                                    }}
                                                />
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleAddNewCollection}>Add Collection</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 items-center">
                                <Label>Mood:</Label>
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
                        </div>


                        <Button onClick={handleSaveEntry} className="self-end mb-4 w-full md:w-auto">
                            {editingEntryId ? "Update Entry" : "Save Entry"}
                        </Button>
                        {editingEntryId && (
                            <Button 
                                variant="outline"
                                onClick={() => {
                                    setManualEntry("");
                                    setEntryTitle("");
                                    setEntryImage(null);
                                    setCollectionTag("");
                                    setSelectedMood(undefined);
                                    setEditingEntryId(null);
                                }}
                                className="ml-2 w-full md:w-auto"
                            >Cancel Edit</Button>
                        )}
                    </div>
                    
                    {todayEntries.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Today's Entries:</h3>
                            <div className="space-y-4">
                                {todayEntries.map((entry) => (
                                    <Card key={entry.id} className="p-4 flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <CardTitle className="text-md flex items-center gap-2">
                                                {entry.title && <span className="font-bold">{entry.title} - </span>}
                                                {format(new Date(entry.date), "h:mm a")}
                                                {entry.mood && <span className="text-2xl ml-2">{entry.mood}</span>}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" onClick={() => handleEditEntry(entry)}>
                                                    <PenSquare className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {entry.image && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={entry.image} alt="Journal entry image" className="w-full h-auto rounded-md mb-2" />
                                        )}
                                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{entry.summary}</p>
                                        {entry.collectionTag && (
                                            <p className="text-xs text-blue-500 mt-2">#{entry.collectionTag}</p>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-accent p-4 rounded-md mt-6">
                        <h3 className="text-lg font-semibold mb-2">Journaling Ideas:</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground max-h-48 overflow-y-auto">
                            {displayedIdeas.map((idea, index) => (
                                <li key={index} className="mb-1">{idea}</li>
                            ))}
                        </ul>
                        <Button onClick={shuffleIdeas} className="mt-2 w-full">Shuffle Ideas</Button>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
