"use client";

import { useState, useEffect, useCallback } from 'react';
import { format, isSameDay, parseISO, isWeekend } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { DailySummary, Reminder, Checklist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Bell, ListTodo, CheckCircle, MapPin, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayContentProps } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getJournalEntries, updateJournalEntry, addManualJournalEntry, deleteJournalEntry } from '@/services/journal-service';
import { getReminders, deleteReminder } from '@/services/reminder-service';
import { getChecklists, deleteChecklist, updateChecklist } from '@/services/checklist-service';
import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(null);
  const [selectedJournalEntries, setSelectedJournalEntries] = useState<DailySummary[]>([]); // New state for all journal entries on the day
  const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<Checklist[]>([]);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAvailableForTribe, setIsAvailableForTribe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set initial date only on the client
    setDate(new Date());
  }, []);
  
  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setIsLoading(true);
      try {
        const [fetchedSummaries, fetchedReminders, fetchedChecklists] = await Promise.all([
          getJournalEntries(user.uid),
          getReminders(user.uid),
          getChecklists(user.uid)
        ]);
        setDailySummaries(fetchedSummaries);
        setReminders(fetchedReminders);
        setChecklists(fetchedChecklists);
      } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load your calendar data." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user, toast]);

  const CustomDayContent = useCallback((props: DayContentProps) => {
      const dayData = dailySummaries.find(d => isSameDay(parseISO(d.date), props.date));
      const dayReminders = reminders.filter(r => isSameDay(parseISO(r.date), props.date));
      const dayChecklists = checklists.filter(c => isSameDay(parseISO(c.date), props.date));
  
      if (props.displayMonth.getMonth() !== props.date.getMonth()) {
        return <DayContent {...props} />;
      }
    
      return (
        <div className="relative w-full h-full flex flex-col items-center justify-start p-1">
          <DayContent {...props} />
          <div className="flex text-xs md:text-sm gap-1 mt-1 absolute bottom-2 items-center">
              {dayData && (
                <>
                  {dayData.mood && <span>{dayData.mood}</span>}
                  {dayData.hasMeetup && <span>☕️</span>}
                  {dayData.isAvailable && !dayData.hasMeetup && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />}
                </>
              )}
              {dayReminders.length > 0 && <Bell className="w-3 h-3 md:w-4 md:h-4 text-primary" />}
              {dayChecklists.length > 0 && <ListTodo className="w-3 h-3 md:w-4 md:h-4 text-primary" />}
          </div>
        </div>
      );
  }, [dailySummaries, reminders, checklists]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const dayJournalEntries = dailySummaries.filter(d => isSameDay(parseISO(d.date), selectedDate));
      const summary = dayJournalEntries.length > 0 ? dayJournalEntries[0] : null; // Keep first for availability toggle
      const dayReminders = reminders.filter(r => isSameDay(parseISO(r.date), selectedDate));
      const dayChecklists = checklists.filter(c => isSameDay(parseISO(c.date), selectedDate));
      
      setSelectedSummary(summary);
      setSelectedJournalEntries(dayJournalEntries); // Set all journal entries for the day
      setSelectedReminders(dayReminders);
      setSelectedChecklists(dayChecklists);
      setIsAvailableForTribe(summary?.isAvailable || false);
      setIsSheetOpen(true);
    } else {
      setSelectedSummary(null);
      setSelectedJournalEntries([]); // Clear all journal entries
      setSelectedReminders([]);
      setSelectedChecklists([]);
      setIsSheetOpen(false);
    }
  };
  
  const handleDeleteReminder = async (reminderId: string) => {
    if (!user) return;
    const originalReminders = [...reminders];
    const reminderToDelete = reminders.find(r => r.id === reminderId);
    
    // Optimistic UI update
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    setSelectedReminders(prev => prev.filter(r => r.id !== reminderId));

    try {
      await deleteReminder(reminderId);
      toast({
          variant: "destructive",
          title: "Reminder Deleted",
          description: `\"${reminderToDelete?.title}\" has been removed.`
      });
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      setReminders(originalReminders); // Revert on error
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete reminder.' });
    }
  }

  const handleDeleteChecklist = async (checklistId: string) => {
    if (!user) return;
    const originalChecklists = [...checklists];
    const checklistToDelete = checklists.find(c => c.id === checklistId);
    
    // Optimistic UI update
    setChecklists(prev => prev.filter(c => c.id !== checklistId));
    setSelectedChecklists(prev => prev.filter(c => c.id !== checklistId));

    try {
      await deleteChecklist(checklistId);
      toast({
          variant: "destructive",
          title: "Checklist Deleted",
          description: `\"${checklistToDelete?.title}\" has been removed.`
      });
    } catch (error) {
      console.error("Failed to delete checklist:", error);
      setChecklists(originalChecklists); // Revert on error
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete checklist.' });
    }
  }

  const toggleChecklistItem = async (checklistId: string, itemId: string) => {
    if(!user) return;
    const originalChecklists = checklists.map(c => ({...c, items: [...c.items]}));
    
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

    // Optimistic UI update
    setChecklists(newChecklists);
    setSelectedChecklists(prev => prev.map(c => c.id === checklistId ? updatedChecklist! : c));
    
    try {
      if (updatedChecklist) {
        await updateChecklist(checklistId, { items: updatedChecklist.items });
      }
    } catch(error) {
      console.error("Failed to update checklist item:", error);
      setChecklists(originalChecklists); // Revert on error
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update checklist item.' });
    }
  }

  const handleAvailabilityChange = async (checked: boolean) => {
    if (!user || !date) return;
    
    setIsAvailableForTribe(checked);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    try {
      if (selectedSummary && selectedSummary.id) {
        // Update existing entry
        await updateJournalEntry(selectedSummary.id, selectedSummary.summary || '', selectedSummary.mood, selectedSummary.title, selectedSummary.image, selectedSummary.collectionTag, checked);
        
        const newSummaries = dailySummaries.map(summary => 
          summary.id === selectedSummary.id ? { ...summary, isAvailable: checked } : summary
        );
        setDailySummaries(newSummaries);
        setSelectedSummary(prev => prev ? { ...prev, isAvailable: checked } : null);

      } else {
        // Create a new entry
        const newEntryData = {
          userId: user.uid,
          dateString: format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'"), // ISO string for addManualJournalEntry
          summary: '', // No summary for just availability
          isAvailable: checked,
        };
        const newEntryRef = await addManualJournalEntry(newEntryData.userId, newEntryData.dateString, newEntryData.summary, undefined, undefined, undefined, undefined, newEntryData.isAvailable);

        const newSummaries = [...dailySummaries, { 
            id: newEntryRef.id,
            userId: user.uid,
            date: newEntryData.dateString,
            summary: newEntryData.summary,
            isAvailable: checked
        }];
        setDailySummaries(newSummaries);
        setSelectedSummary({
            id: newEntryRef.id,
            userId: user.uid,
            date: newEntryData.dateString,
            summary: newEntryData.summary,
            isAvailable: checked
        });
      }
      
      toast({
          title: "Availability Updated",
          description: `You are now marked as ${checked ? 'available' : 'unavailable'} for tribe meetups on this day.`
      });
    } catch (error) {
      console.error("Failed to update availability:", error);
      setIsAvailableForTribe(!checked); // Revert on error
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update availability.' });
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!user || !entryId) return;
    const originalSummaries = [...dailySummaries];
    const summaryToDelete = dailySummaries.find(s => s.id === entryId);
    
    // Optimistic UI update
    setDailySummaries(prev => prev.filter(s => s.id !== entryId));
    setSelectedJournalEntries(prev => prev.filter(s => s.id !== entryId));
    if (selectedSummary?.id === entryId) {
      setSelectedSummary(null);
    }

    try {
      await deleteJournalEntry(entryId);
      toast({
          variant: "destructive",
          title: "Deleted Summary",
          description: `Entry for ${summaryToDelete?.date} has been deleted.`
      });
    } catch(error) {
      console.error("Failed to delete summary:", error);
      setDailySummaries(originalSummaries); // Revert
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete summary.' });
    }
  }

  const handleEdit = (summary: DailySummary) => {
    if (!summary) return;
    toast({
        title: "Editing Summary",
        description: `Editing entry for ${summary.date}. (Functionality not implemented)`
    })
  }
  
  const isSelectedDateWeekend = date ? isWeekend(date) : false;

  if (isLoading) {
    return (
      <Card className="flex-1 flex flex-col">
         <CardHeader>
            <CardTitle>Your Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-2 md:p-6 pt-0">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
         <CardHeader>
            <CardTitle>Your Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-2 md:p-6 pt-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="w-full h-full flex flex-col"
            classNames={{
                months: "flex-1 flex flex-col",
                month: "space-y-4 flex-1 flex flex-col",
                table: "w-full border-collapse flex-1 flex flex-col",
                head_row: "grid grid-cols-7",
                head_cell: "text-center text-muted-foreground text-sm font-normal",
                tbody: "flex-1 grid grid-cols-7 grid-rows-6",
                row: "contents",
                cell: cn(
                  "relative p-0 text-center text-sm",
                  "border-t border-l first:border-l-0",
                  "[&:nth-child(7n)]:border-r-0",
                  "has-[[aria-selected]]:bg-accent"
                ),
                day: cn(
                    "w-full h-full rounded-none text-lg p-2",
                    "hover:bg-accent/50 transition-colors"
                ),
                day_outside: "text-muted-foreground/50",
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            }}
            components={{
              DayContent: CustomDayContent,
            }}
          />
        </CardContent>
      </Card>
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-lg">
          <SheetHeader>
            <SheetTitle className="font-headline text-2xl">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </SheetTitle>
            <SheetDescription>
              Your summary, reminders, and insights for the selected day.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {(selectedJournalEntries.length > 0 || selectedReminders.length > 0 || selectedChecklists.length > 0) ? (
              <div className="space-y-4">
                
                {selectedSummary?.hasMeetup && selectedSummary.meetupDetails && (
                    <div className="p-3 bg-secondary rounded-lg text-secondary-foreground">
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Tribe Meetup
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> Time: {selectedSummary.meetupDetails.time}</p>
                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location: {selectedSummary.meetupDetails.location}</p>
                            <div className="flex items-center gap-2">Tribe ID: <Badge variant="outline" className="bg-background/20 border-background/50">{selectedSummary.meetupDetails.tribeId}</Badge></div>
                        </div>
                    </div>
                )}
                
                {selectedChecklists.length > 0 && (
                  <div className="space-y-2">
                    {selectedChecklists.map(checklist => (
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
                )}

                {selectedReminders.length > 0 && (
                    <div className="space-y-2">
                        {selectedReminders.map(reminder => (
                            <div key={reminder.id} className="flex items-start gap-3 p-3 bg-card border rounded-lg">
                                <Bell className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{reminder.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {format(new Date(`${reminder.date}T${reminder.time}`), 'p')}
                                        {reminder.details && ` - ${reminder.details}`}
                                    </p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteReminder(reminder.id!)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                
                {selectedJournalEntries.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold">Journal Entries</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedJournalEntries.map(entry => (
                        <div key={entry.id} className="p-3 bg-card border rounded-lg flex flex-col justify-between">
                          <div>
                              <p className="text-sm text-muted-foreground italic mb-2">
                                  "{entry.summary}"
                              </p>
                              {entry.mood && (
                                  <div className="mb-2">
                                      <h4 className="font-semibold text-sm">Vibe</h4>
                                      <p className="text-lg">{entry.mood}</p>
                                  </div>
                              )}
                          </div>
                          <div className="flex gap-2 justify-end mt-auto">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                                  <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id!)}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                 {selectedSummary && !selectedSummary.hasMeetup && (
                    <div>
                        <h3 className="font-semibold">Availability</h3>
                        <p className="text-sm text-muted-foreground">
                            {selectedSummary.isAvailable ? "Available to meet ❤️" : "Not available"}
                        </p>
                    </div>
                 )}
                
                {isSelectedDateWeekend && (
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                             <div>
                                <h3 className="font-semibold">Tribe Meetups</h3>
                                <Label htmlFor="tribe-availability" className="text-sm text-muted-foreground">
                                    Mark yourself as available for a tribe meetup on this day.
                                 </Label>
                             </div>
                            <Switch 
                                id="tribe-availability"
                                checked={isAvailableForTribe}
                                onCheckedChange={handleAvailabilityChange}
                                disabled={selectedSummary?.hasMeetup}
                            />
                        </div>
                    </div>
                )}

              </div>
            ) : (
              <div className="text-center text-muted-foreground pt-8">
                <p>No entries or reminders for this day.</p>
                {isSelectedDateWeekend && (
                     <div className="mt-4 border-t pt-4">
                        <div className="flex items-center justify-between max-w-sm mx-auto">
                             <div>
                                <h3 className="font-semibold text-left">Tribe Meetups</h3>
                                <Label htmlFor="tribe-availability" className="text-sm text-muted-foreground">
                                    Mark yourself as available for a tribe meetup on this day.
                                </Label>
                             </div>
                            <Switch 
                                id="tribe-availability"
                                checked={isAvailableForTribe}
                                onCheckedChange={handleAvailabilityChange}
                            />
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
