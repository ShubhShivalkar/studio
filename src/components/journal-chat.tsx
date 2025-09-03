
"use client";

import { guideJournalingWithQuestions } from "@/ai/flows/guide-journaling-with-questions";
import { summarizeJournalConversation } from "@/ai/flows/summarize-journal-conversation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { dailySummaries, currentUser, reminders, checklists } from "@/lib/mock-data";
import { Bot, SendHorizonal, CheckCircle, RotateCcw, Heart, BookOpen, BrainCircuit, Smile } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import Image from "next/image";

const MAX_AI_QUESTIONS = 10;

const getInitialMessage = (name?: string) => {
    const userName = name ? `, ${name.split(' ')[0]}` : '';
    return {
        id: '0',
        sender: 'ai' as const,
        text: `Hi${userName}, I'm Anu, your journaling companion. What's on your mind today?`
    };
};

export function JournalChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userName = useMemo(() => currentUser.name.split(' ')[0], []);
  const initialMessage = useMemo(() => getInitialMessage(currentUser.name), [currentUser.name]);

  const STORAGE_KEY_MESSAGES = useMemo(() => `journalChatMessages_${currentUser.id}`, [currentUser.id]);
  const STORAGE_KEY_DATE = useMemo(() => `journalChatDate_${currentUser.id}`, [currentUser.id]);


  const aiQuestionCount = useMemo(() => {
    // We subtract 1 to not count the initial greeting
    return messages.filter(m => m.sender === 'ai').length - 1;
  }, [messages]);
  
  const hasStartedConversation = useMemo(() => messages.length > 1, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const storedDate = localStorage.getItem(STORAGE_KEY_DATE);
    
    if (storedDate === todayStr) {
        const storedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (storedMessages) {
            try {
                const parsedMessages = JSON.parse(storedMessages);
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
  }, [initialMessage, STORAGE_KEY_DATE, STORAGE_KEY_MESSAGES]);

  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
        localStorage.setItem(STORAGE_KEY_DATE, format(new Date(), 'yyyy-MM-dd'));
        scrollToBottom();
    }
  }, [messages, isInitialized, STORAGE_KEY_DATE, STORAGE_KEY_MESSAGES]);

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
     setIsLoading(true);
     try {
      const journalHistory = currentUser.journalEntries?.join("\n\n") || "";
      
      const remindersText = reminders.map(r => `- ${r.title} on ${r.date} at ${r.time}`).join("\n");
      
      const checklistsText = checklists.map(c => 
        `List: ${c.title}\n` + c.items.map(i => `  - [${i.completed ? 'x' : ' '}] ${i.text}`).join("\n")
      ).join("\n\n");

      const { question } = await guideJournalingWithQuestions({ 
          topic, 
          userName, 
          journalHistory,
          reminders: remindersText,
          checklists: checklistsText
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

        // Save to mock data
        const today = new Date();
        const todayStr = format(today, 'yyyy-MM-dd');
        
        // Update or create today's summary
        const existingSummaryIndex = dailySummaries.findIndex(d => d.date === todayStr);
        if (existingSummaryIndex > -1) {
            dailySummaries[existingSummaryIndex] = {
                ...dailySummaries[existingSummaryIndex],
                summary,
                mood
            };
        } else {
            dailySummaries.push({
                date: todayStr,
                summary,
                mood,
                hobbies: [],
                isAvailable: false,
                hasMeetup: false
            });
        }
        
        // Add to user's journal entries
        if (!currentUser.journalEntries) {
            currentUser.journalEntries = [];
        }
        currentUser.journalEntries.push(summary);

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
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    localStorage.removeItem(STORAGE_KEY_DATE);
    setMessages([initialMessage]);
    setIsComplete(false);
    setInput("");
  }

  if (!isInitialized) {
    return null; // or a loading spinner
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
                  <AvatarImage src="https://picsum.photos/seed/indian-woman/200/200" alt="Anu" data-ai-hint="indian woman" />
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
                  <AvatarImage src="https://picsum.photos/seed/indian-woman/200/200" alt="Anu" data-ai-hint="indian woman" />
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
            <div className="flex items-center justify-center text-center p-4 bg-secondary rounded-lg">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <p className="text-sm text-muted-foreground">Journal entry for today is complete.</p>
                 <Button variant="ghost" size="sm" onClick={handleNewChat} className="ml-4">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    New Chat
                 </Button>
            </div>
        ) : (
            <div className="space-y-4">
                {!hasStartedConversation && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button variant="outline" onClick={() => handleInitialPrompt("my hobby")}>
                            <Heart className="mr-2 h-4 w-4" /> Hobby
                        </Button>
                        <Button variant="outline" onClick={() => handleInitialPrompt("my mood")}>
                            <Smile className="mr-2 h-4 w-4" /> Mood
                        </Button>
                        <Button variant="outline" onClick={() => handleInitialPrompt("something I learned")}>
                            <BrainCircuit className="mr-2 h-4 w-4" /> Learning
                        </Button>
                        <Button variant="outline" onClick={() => handleInitialPrompt("my day in general")}>
                            <BookOpen className="mr-2 h-4 w-4" /> Share your day
                        </Button>
                    </div>
                )}
                <div className="relative">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Textarea
                        placeholder="Type your thoughts here..."
                        className="pr-20 min-h-[50px] resize-none flex-1"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                handleSendMessage(e);
                            }
                        }}
                    />
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
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
