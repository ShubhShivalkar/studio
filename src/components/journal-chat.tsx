
"use client";

import { guideJournalingWithQuestions } from "@/ai/flows/guide-journaling-with-questions";
import { summarizeJournalConversation } from "@/ai/flows/summarize-journal-conversation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { DailySummary, Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, SendHorizonal, CheckCircle, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isSameDay, parseISO } from 'date-fns';
import { useAuth } from "@/context/auth-context";
import { getReminders } from "@/services/reminder-service";
import { getChecklists } from "@/services/checklist-service";
import { setJournalEntry, addJournalSummaryToUser, getJournalEntries } from "@/services/journal-service";

const MAX_AI_QUESTIONS = 10;

const PROMPT_SUGGESTIONS = [
    "a recent accomplishment", "something I'm grateful for", "a challenge I'm facing", "a dream I had recently",
    "my favorite hobby", "a book I'm reading", "a movie I just watched", "my favorite song right now",
    "a memory from childhood", "a goal I have for this week", "what my ideal day looks like", "a person I admire",
    "something that made me smile today", "a place I want to visit", "my current mood", "a skill I want to learn",
    "what I'm looking forward to", "a lesson I've learned recently", "how I'm feeling physically",
    "a fear I want to overcome", "my favorite season and why", "a simple pleasure I enjoy", "something I'm proud of",
    "a personal project I'm working on", "how I like to relax", "a compliment I received", "something I'm curious about",
    "a mistake I made and what I learned", "my relationship with my family", "my friendships", "my career goals",
    "something new I tried recently", "a food I've been craving", "the best part of my day", "a worry on my mind",
    "what creativity means to me", "my morning routine", "my evening routine", "a piece of advice I'd give my younger self",
    "how I've changed in the past year", "a quality I like about myself", "a habit I want to change",
    "the last time I felt truly happy", "a moment of kindness I witnessed", "what's on my shopping list",
    "a conversation that stuck with me", "my favorite way to exercise", "something I'm procrastinating on",
    "my definition of success", "a moment I felt brave", "how I handle stress", "a favorite quote",
    "the most beautiful thing I saw today", "a podcast I'm listening to", "my thoughts on social media",
    "a time I helped someone", "something I'm letting go of", "my plans for the weekend", "a new restaurant I want to try",
    "what I think about my hometown", "a travel story", "my favorite app on my phone", "a moment of peace and quiet",
    "something I'm excited to learn", "my feelings about the future", "a current event on my mind",
    "how I stay organized", "a task I completed today", "my favorite thing about my home", "a piece of art that moved me",
    "what I'm listening to right now", "a challenge at work", "a success at work", "my relationship with money",
    "a time I felt inspired", "something I'm optimistic about", "a TV show I'm binging", "how I connect with nature",
    "a goal for the month", "my thoughts on journaling", "a moment of self-care", "something that's been bugging me",
    "a fashion trend I like", "my favorite type of weather", "a joke that made me laugh", "what my name means to me",
    "a difficult decision I'm facing", "my sleep patterns", "something I'm celebrating", "a memory with a friend",
    "my favorite holiday", "a scent that brings back memories", "a question I'm pondering", "a new recipe I tried"
];


const getInitialMessage = (name?: string, todaysSummary?: DailySummary | null) => {
    const userName = name ? `, ${name.split(' ')[0]}` : '';
    let text = `Hi${userName}, I'm Anu, your journaling companion. What's on your mind today?`;

    if (todaysSummary?.summary) {
        text = `Hi${userName}! I see you've already written a bit today about:\n\n*"${todaysSummary.summary}"*\n\nWould you like to reflect more on that, or is there something new on your mind?`;
    }
    
    return {
        id: '0',
        sender: 'ai' as const,
        text: text
    };
};

export function JournalChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [timezone, setTimezone] = useState('');
  const [todaysSummary, setTodaysSummary] = useState<DailySummary | null>(null);
  
  const userName = useMemo(() => profile?.name.split(' ')[0] || 'there', [profile]);
  
  const STORAGE_KEY_MESSAGES = useMemo(() => `journalChatMessages_${profile?.id}`, [profile]);
  const STORAGE_KEY_DATE = useMemo(() => `journalChatDate_${profile?.id}`, [profile]);

  useEffect(() => {
    // Get client's timezone once the component mounts
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const aiQuestionCount = useMemo(() => {
    return messages.filter(m => m.sender === 'ai').length - 1;
  }, [messages]);
  
  const hasStartedConversation = useMemo(() => messages.length > 1, [messages]);

  useEffect(() => {
    const getShuffledPrompts = () => {
        const shuffled = [...PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
    };
    getShuffledPrompts();
  }, []);


  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    if (!profile) return;
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
    
    // Fetch today's summary regardless of local storage state
    getJournalEntries(profile.id).then(entries => {
        const summaryForToday = entries.find(e => e.date === todayStr) || null;
        setTodaysSummary(summaryForToday);

        const initialMessage = getInitialMessage(profile?.name, summaryForToday);
        
        if (storedDate === todayStr) {
            const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
            if (storedMessages) {
                try {
                    const parsedMessages = JSON.parse(storedMessages);
                    // Use stored messages but ensure the first message is the latest initial message
                    parsedMessages[0] = initialMessage;
                    setMessages(parsedMessages);
                    const lastMessage = parsedMessages[parsedMessages.length - 1];
                    if (lastMessage && lastMessage.text.includes("I've saved this as your journal entry.")) {
                        setIsComplete(true);
                    }
                } catch (e) {
                    setMessages([initialMessage]);
                }
            } else {
                 setMessages([initialMessage]);
            }
        } else {
            localStorage.removeItem(STORAGE_KEY_MESSAGES);
            localStorage.removeItem(STORAGE_KEY_DATE);
            setMessages([initialMessage]);
        }
        setIsInitialized(true);
    });
    
  }, [STORAGE_KEY_DATE, STORAGE_KEY_MESSAGES, profile]);

  useEffect(() => {
    if (isInitialized && profile) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
        localStorage.setItem(STORAGE_KEY_DATE, format(new Date(), 'yyyy-MM-dd'));
        scrollToBottom();
    }
  }, [messages, isInitialized, STORAGE_KEY_DATE, STORAGE_KEY_MESSAGES, profile]);

  const handleInitialPrompt = (topic: string) => {
    if (isLoading || isComplete) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: topic,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    getNewQuestion(topic);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isComplete) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    
    if (aiQuestionCount >= MAX_AI_QUESTIONS -1) {
        handleSummarize(newMessages);
    } else {
        getNewQuestion(input);
    }
  };

  const getNewQuestion = async (topic: string) => {
     if (!profile) return;
     setIsLoading(true);
     try {
      const journalHistory = profile.journalEntries?.join("\n\n") || "";
      
      const reminders = await getReminders(profile.id);
      const checklists = await getChecklists(profile.id);

      const remindersText = reminders.map(r => `- ${r.title} on ${r.date} at ${r.time}`).join("\n");
      const checklistsText = checklists.map(c => 
        `List: ${c.title}\n` + c.items.map(i => `  - [${i.completed ? 'x' : ' '}] ${i.text}`).join("\n")
      ).join("\n\n");

      const { question } = await guideJournalingWithQuestions({ 
          topic, 
          userName, 
          journalHistory,
          reminders: remindersText,
          checklists: checklistsText,
          timezone,
          dob: profile.dob,
          profession: profile.profession,
          todaysSummary: todaysSummary?.summary,
      });
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: question,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm having trouble connecting right now. Let's try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSummarize = async (finalMessages: Message[]) => {
    if (!profile) return;
    setIsLoading(true);
    setIsSummarizing(true);
    
    const conversationHistory = finalMessages
        .map(m => `${m.sender === 'ai' ? 'Anu' : 'User'}: ${m.text}`)
        .join('\n');

    try {
        const { summary, mood } = await summarizeJournalConversation({ conversationHistory });
        
        const summaryMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: `Here is a summary of your thoughts today:\n\n"${summary}"\n\nI've saved this as your journal entry.`
        };
        setMessages(prev => [...prev, summaryMessage]);

        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        
        await setJournalEntry(profile.id, { date: todayStr, summary, mood });
        await addJournalSummaryToUser(profile.id, summary);
        
        // Also update profile in context optimistically
        if(profile.journalEntries) {
            profile.journalEntries.push(summary);
        } else {
            profile.journalEntries = [summary];
        }

        setIsComplete(true);

    } catch (error) {
        console.error("Failed to summarize conversation:", error);
        const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: "I'm sorry, I had trouble summarizing our conversation. Please try again later.",
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
        setIsSummarizing(false);
    }
  }

  const handleNewChat = () => {
    if (!profile) return;
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    // We don't remove the date, so if they refresh, the old convo comes back for the same day.
    // This allows multiple sessions in one day.
    const initialMessage = getInitialMessage(profile.name, todaysSummary);
    setMessages([initialMessage]);
    setIsComplete(false);
    setInput("");
    const shuffled = [...PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 4));
  }

  if (!isInitialized || !profile) {
    return null;
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3",
                message.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === "ai" && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://storage.googleapis.com/aai-web-samples/nextjs/anu/anu.jpeg" alt="Anu" data-ai-hint="indian woman" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs md:max-w-md lg:max-w-2xl rounded-lg p-3 text-sm whitespace-pre-wrap",
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border"
                )}
              >
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarImage src="https://storage.googleapis.com/aai-web-samples/nextjs/anu/anu.jpeg" alt="Anu" data-ai-hint="indian woman" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot />
                  </AvatarFallback>
                </Avatar>
              <div className="bg-card border rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{isSummarizing ? 'Creating summary...' : 'Thinking...'}</span>
                   <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background border-t">
        {isComplete ? (
            <div className="flex flex-col sm:flex-row items-center justify-center text-center gap-2 p-4 bg-secondary rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-muted-foreground">Journal entry for today is complete.</p>
                 <Button variant="ghost" size="sm" onClick={handleNewChat} className="ml-0 sm:ml-4">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Chat
                 </Button>
            </div>
        ) : (
            <div className="space-y-4">
                {!hasStartedConversation && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {suggestions.map((prompt, index) => (
                             <Button key={index} variant="outline" size="sm" onClick={() => handleInitialPrompt(prompt)}>
                                {prompt.charAt(0).toUpperCase() + prompt.slice(1)}
                             </Button>
                        ))}
                    </div>
                )}
                <div className="relative">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Textarea
                        placeholder="Type your thoughts here..."
                        className="pr-24 min-h-[50px] resize-none flex-1"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                        >
                            <SendHorizonal className="h-5 w-5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={handleNewChat} title="Start New Chat">
                            <RotateCcw className="h-5 w-5" />
                        </Button>
                    </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
