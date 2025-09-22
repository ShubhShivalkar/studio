"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { getAllJournalEntries } from "@/services/journal-service";
import { getReminders, deleteReminder } from "@/services/reminder-service";
import { getChecklists, deleteChecklist, updateChecklist } from "@/services/checklist-service";
import { getCurrentTribe } from '@/services/tribe-service';
import type { DailySummary, Reminder, Checklist, GeneratePersonalityPersonaOutput, Tribe } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, ListTodo, Trash2, Briefcase, HandHeart, Bot, Users, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

export default function MySpacePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [journalEntries, setJournalEntries] = useState<DailySummary[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DailySummary[]>([]);
  const [hashtagFilter, setHashtagFilter] = useState("all");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [persona, setPersona] = useState<GeneratePersonalityPersonaOutput | null>(null);
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const leftSectionRef = useRef<HTMLDivElement>(null);
  const centerSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [fetchedJournalEntries, fetchedReminders, fetchedChecklists, fetchedTribe] = await Promise.all([
          getAllJournalEntries(user.uid),
          getReminders(user.uid),
          getChecklists(user.uid),
          getCurrentTribe(user.uid),
        ]);
        setJournalEntries(fetchedJournalEntries);
        setFilteredEntries(fetchedJournalEntries);
        setReminders(fetchedReminders);
        setChecklists(fetchedChecklists);
        setTribe(fetchedTribe);
      } catch (error) {
        console.error("Failed to fetch My Space data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load your activities." });
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (profile?.persona) {
      setPersona({
        persona: profile.persona,
        hobbies: profile.hobbies || [],
        interests: profile.interests || [],
        personalityTraits: [],
        mbti: profile.mbti || "N/A",
      });
    }
  }, [profile]);

  const uniqueHashtags = useMemo(() => {
    const tags = new Set<string>();
    journalEntries.forEach(entry => {
      if (entry.collectionTag) {
        tags.add(entry.collectionTag);
      }
    });
    return Array.from(tags).sort();
  }, [journalEntries]);

  useEffect(() => {
    if (hashtagFilter === "all") {
      setFilteredEntries(journalEntries);
    } else {
      setFilteredEntries(
        journalEntries.filter(entry =>
          entry.collectionTag?.toLowerCase() === hashtagFilter.toLowerCase()
        )
      );
    }
  }, [hashtagFilter, journalEntries]);

  const handleDeleteReminder = async (reminderId: string) => {
    if (!user) return;
    const originalReminders = [...reminders];
    const reminderToDelete = reminders.find(r => r.id === reminderId);

    setReminders(prev => prev.filter(r => r.id !== reminderId));

    try {
      await deleteReminder(reminderId);
      toast({
        variant: "destructive",
        title: "Reminder Deleted",
        description: `\"${reminderToDelete?.title}\" has been removed.`
      });
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      setReminders(originalReminders);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete reminder.' });
    }
  }

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!user) return;
    const originalChecklists = [...checklists];
    const checklistToDelete = checklists.find(c => c.id === checklistId);

    setChecklists(prev => prev.filter(c => c.id !== checklistId));

    try {
      await deleteChecklist(checklistId);
      toast({
        variant: "destructive",
        title: "Checklist Deleted",
        description: `\"${checklistToDelete?.title}\" has been removed.`
      });
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      setChecklists(originalChecklists);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete checklist.' });
    }
  }

  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    if (!user) return;
    const originalChecklists = checklists.map(c => ({ ...c, items: [...c.items] }));

    let updatedChecklist: Checklist | undefined;
    const newChecklists = checklists.map(checklist => {
      if (checklist.id === checklistId) {
        const updatedItems = checklist.items.map(item =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        updatedChecklist = { ...checklist, items: updatedItems };
        return updatedChecklist;
      }
      return checklist;
    });

    setChecklists(newChecklists);

    try {
      if (updatedChecklist) {
        await updateChecklist(checklistId, { items: updatedChecklist.items });
      }
    } catch (error) {
      console.error("Failed to update checklist item:", error);
      setChecklists(originalChecklists);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update checklist item.' });
    }
  }

  const isPersonaValid = persona && persona.persona && !persona.persona.includes("Could not generate") && !persona.persona.includes("unexpected error");

  const currentUserInTribe = tribe?.members.find(m => m.userId === user?.uid);
  const showTribeCard = tribe && currentUserInTribe?.rsvpStatus !== 'rejected';
  const isTribeComplete = tribe && tribe.members.filter(m => m.rsvpStatus !== 'rejected').length >= 4;

  useEffect(() => {
    if (isLoading) return;
    
    const leftHeight = leftSectionRef.current?.offsetHeight || 0;
    const centerHeight = centerSectionRef.current?.offsetHeight || 0;
    const rightHeight = rightSectionRef.current?.offsetHeight || 0;

    const maxHeight = Math.max(leftHeight, centerHeight, rightHeight);

    if (leftSectionRef.current) {
      leftSectionRef.current.style.height = `${maxHeight}px`;
    }
    if (centerSectionRef.current) {
      centerSectionRef.current.style.height = `${maxHeight}px`;
    }
    if (rightSectionRef.current) {
      rightSectionRef.current.style.height = `${maxHeight}px`;
    }
  }, [isLoading, journalEntries, reminders, checklists, showTribeCard]);

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>My Space</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-4 h-full md:grid-cols-1">

          {/* Left Sidebar */}
          <div className="flex flex-col gap-4 sticky top-0 h-screen overflow-y-auto md:static md:h-auto" ref={leftSectionRef} style={{height: 'auto'}}>
           

            {/* Persona Section */}
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-primary" /> Your Persona
                </CardTitle>
                <CardDescription>
                  An AI-generated reflection of you based on your activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {isPersonaValid ? (
                  <ScrollArea className="h-full w-full rounded-md p-2">
                    <div className="space-y-4">
                      <p className="italic text-foreground/80">{persona?.persona}</p>
                      {persona?.mbti && (
                        <div>
                          <h3 className="font-semibold mb-2">Personality Type</h3>
                          <Badge variant="secondary">{persona.mbti}</Badge>
                        </div>
                      )}
                      {persona?.hobbies.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Hobbies</h3>
                          <div className="flex flex-wrap gap-2">
                            {persona.hobbies.map((hobby, index) => (
                              <Badge key={index} variant="secondary">{hobby}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {persona?.interests.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {persona.interests.map((interest, index) => (
                              <Badge key={index} variant="secondary">{interest}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-muted-foreground py-8 flex-1 flex flex-col items-center justify-center">
                    <p>Generate your persona on the Profile page.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Center Feed */}
          <div className="flex flex-col" ref={centerSectionRef} style={{height: 'auto'}}>
            <h2 className="text-xl font-semibold mb-4">My Journal Entries</h2>
            <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
              <Label htmlFor="hashtag-filter" className="sr-only">Filter by Hashtag</Label>
              <Select onValueChange={setHashtagFilter} value={hashtagFilter}>
                <SelectTrigger id="hashtag-filter" className="w-[180px]">
                  <SelectValue placeholder="Filter by #hashtag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  {uniqueHashtags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      #{tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="h-full w-full rounded-md border p-4" style={{ height: 'calc(100vh - 200px)' }}>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <div key={entry.id} className="p-4 border rounded-lg shadow-sm">
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(entry.date), 'PPP p')}
                      </p>
                      <p className="text-lg font-medium">{entry.summary}</p>
                      {entry.mood && <p className="text-sm text-gray-500">Mood: {entry.mood}</p>}
                      {entry.collectionTag && <p className="text-sm text-primary">#{entry.collectionTag}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">No journal entries found {hashtagFilter !== "all" && `for #${hashtagFilter}`}.</p>
              )}
            </ScrollArea>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-4 sticky top-0 h-screen overflow-y-auto md:static md:h-auto" ref={rightSectionRef} style={{height: 'auto'}}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <>              
                {/* Tribe Invitation Section */}
                {
                  showTribeCard ? (
                    <Card className="flex flex-col bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users /> Your Tribe Invitation
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                          {isTribeComplete ? "You've been invited to a meetup!" : "A new tribe is forming."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-2">
                        {isTribeComplete ? (
                          <div className='space-y-1'>
                            <p><strong>Date:</strong> {format(parseISO(tribe.meetupDate), 'PPP')}</p>
                            <p><strong>Time:</strong> {tribe.meetupTime}</p>
                            <p><strong>Location:</strong> {tribe.location}</p>
                          </div>
                        ) : (
                          <p>Your tribe is waiting for more members. We'll notify you when the details are confirmed.</p>
                        )}

                        {currentUserInTribe?.rsvpStatus === 'accepted' && (
                          <Badge variant="secondary" className='flex items-center gap-1 w-fit'><CheckCircle className="h-4 w-4 text-green-500" /> You've Accepted</Badge>
                        )}
                        {currentUserInTribe?.rsvpStatus === 'pending' && (
                          <Badge variant="secondary" className='w-fit'>RSVP Pending</Badge>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="secondary" className="w-full">
                          <Link href="/tribe">View Tribe & RSVP</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Tribe Invitation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        No active tribe invitations at the moment.
                      </CardContent>
                    </Card>
                  )
                }

                {/* Checklists Section */}
                <div className="checklists-section flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">My Checklists</h2>
                  <ScrollArea className="h-full w-full rounded-md border p-4">
                    {checklists.length > 0 ? (
                      <div className="space-y-4">
                        {checklists.map(checklist => (
                          <div key={checklist.id} className="p-3 bg-card border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <ListTodo className="h-5 w-5 text-primary flex-shrink-0" />
                                <h3 className="font-semibold">{checklist.title}</h3>
                              </div>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteChecklist(checklist.id!)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-1 pl-8">
                              {checklist.items.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`${checklist.id}-${item.id}`}
                                    checked={item.completed}
                                    onCheckedChange={() => toggleChecklistItem(checklist.id!, item.id)}
                                  />
                                  <Label htmlFor={`${checklist.id}-${item.id}`} className={cn("text-sm", item.completed && "line-through text-muted-foreground")}>{item.text}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No checklists found.</p>
                    )}
                  </ScrollArea>
                </div>

                {/* Reminders Section */}
                <div className="reminders-section flex flex-col">
                  <h2 className="text-xl font-semibold mb-4">My Reminders</h2>
                  <ScrollArea className="h-full w-full rounded-md border p-4">
                    {reminders.length > 0 ? (
                      <div className="space-y-4">
                        {reminders.map(reminder => (
                          <div key={reminder.id} className="flex items-start gap-3 p-3 bg-card border rounded-lg">
                            <Bell className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-grow">
                              <h3 className="font-semibold">{reminder.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(`${reminder.date}T${reminder.time}`), 'PPP p')}
                                {reminder.details && ` - ${reminder.details}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteReminder(reminder.id!)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center">No reminders found.</p>
                    )}
                  </ScrollArea>
                </div>
              </>)
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
