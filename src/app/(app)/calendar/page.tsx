
"use client";

import { useState, useEffect } from 'react';
import { format, isSameDay, parseISO, isWeekend } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { dailySummaries, reminders as mockReminders, checklists as mockChecklists } from "@/lib/mock-data";
import type { DailySummary, Reminder, Checklist } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, Bell, ListTodo, CheckCircle, MapPin, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayContentProps } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

function CustomDayContent(props: DayContentProps) {
    const dayData = dailySummaries.find(d => isSameDay(parseISO(d.date), props.date));
    const dayReminders = mockReminders.filter(r => isSameDay(parseISO(r.date), props.date));
    const dayChecklists = mockChecklists.filter(c => isSameDay(parseISO(c.date), props.date));

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
                {dayData.hobbies && dayData.hobbies.map((hobby, index) => (
                  <hobby.icon key={index} className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
                ))}
                {dayData.hasMeetup && <span>☕️</span>}
                {dayData.isAvailable && !dayData.hasMeetup && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />}
              </>
            )}
            {dayReminders.length > 0 && <Bell className="w-3 h-3 md:w-4 md:h-4 text-primary" />}
            {dayChecklists.length > 0 && <ListTodo className="w-3 h-3 md:w-4 md:h-4 text-primary" />}
        </div>
      </div>
    );
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [reminders, setReminders] = useState(mockReminders);
  const [checklists, setChecklists] = useState(mockChecklists);
  const [selectedSummary, setSelectedSummary] = useState<Partial<DailySummary> | null>(null);
  const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([]);
  const [selectedChecklists, setSelectedChecklists] = useState<Checklist[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAvailableForTribe, setIsAvailableForTribe] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set initial date only on the client
    setDate(new Date());
  }, []);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const summary = dailySummaries.find(d => isSameDay(parseISO(d.date), selectedDate)) || null;
      const dayReminders = reminders.filter(r => isSameDay(parseISO(r.date), selectedDate));
      const dayChecklists = checklists.filter(c => isSameDay(parseISO(c.date), selectedDate));
      
      setSelectedSummary(summary);
      setSelectedReminders(dayReminders);
      setSelectedChecklists(dayChecklists);
      setIsAvailableForTribe(summary?.isAvailable || false);
      setIsSheetOpen(true);
    } else {
      setSelectedSummary(null);
      setSelectedReminders([]);
      setSelectedChecklists([]);
      setIsSheetOpen(false);
    }
  };
  
  const handleDeleteReminder = (reminderId: string) => {
    const reminderToDelete = reminders.find(r => r.id === reminderId);
    if (!reminderToDelete) return;

    const newReminders = reminders.filter(r => r.id !== reminderId);
    setReminders(newReminders);
    mockReminders.splice(0, mockReminders.length, ...newReminders);

    setSelectedReminders(prev => prev.filter(r => r.id !== reminderId));

    toast({
        variant: "destructive",
        title: "Reminder Deleted",
        description: `"${reminderToDelete.title}" has been removed.`
    });
  }

  const handleDeleteChecklist = (checklistId: string) => {
    const checklistToDelete = checklists.find(c => c.id === checklistId);
    if (!checklistToDelete) return;

    const newChecklists = checklists.filter(c => c.id !== checklistId);
    setChecklists(newChecklists);
    mockChecklists.splice(0, mockChecklists.length, ...newChecklists);

    setSelectedChecklists(prev => prev.filter(c => c.id !== checklistId));

    toast({
        variant: "destructive",
        title: "Checklist Deleted",
        description: `"${checklistToDelete.title}" has been removed.`
    });
  }

  const toggleChecklistItem = (checklistId: string, itemId: string) => {
     const newChecklists = checklists.map(checklist => {
        if (checklist.id === checklistId) {
            const updatedItems = checklist.items.map(item =>
                item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            return { ...checklist, items: updatedItems };
        }
        return checklist;
    });
    setChecklists(newChecklists);
    mockChecklists.splice(0, mockChecklists.length, ...newChecklists);
    
    // Update the selected checklists in the sheet
    setSelectedChecklists(prev => prev.map(c => {
        if(c.id === checklistId){
            return newChecklists.find(nc => nc.id === checklistId)!;
        }
        return c;
    }));
  }

  const handleAvailabilityChange = (checked: boolean) => {
    setIsAvailableForTribe(checked);
    if (date) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const summaryIndex = dailySummaries.findIndex(d => d.date === dateStr);
        if (summaryIndex > -1) {
            dailySummaries[summaryIndex].isAvailable = checked;
        } else {
            // Create a new minimal summary for this day if it doesn't exist
            dailySummaries.push({
                date: dateStr,
                isAvailable: checked,
            });
        }
        
        toast({
            title: "Availability Updated",
            description: `You are now marked as ${checked ? 'available' : 'unavailable'} for tribe meetups on this day.`
        });
        
        // Force a re-render by creating a new date object, which will trigger the calendar's day renderer
        setDate(new Date(date));
    }
  }


  const handleEdit = () => {
    if (!selectedSummary) return;
    toast({
        title: "Editing Summary",
        description: `Editing entry for ${selectedSummary.date}. (Functionality not implemented)`
    })
  }
  
  const handleDelete = () => {
    if (!selectedSummary || !selectedSummary.date) return;
    const dateStr = selectedSummary.date;
    const summaryIndex = dailySummaries.findIndex(d => d.date === dateStr);
    if (summaryIndex > -1) {
        dailySummaries.splice(summaryIndex, 1);
    }
    
    toast({
        variant: "destructive",
        title: "Deleted Summary",
        description: `Entry for ${dateStr} has been deleted. (Frontend only)`
    })
    
    setIsSheetOpen(false);
    setSelectedSummary(null);
    setDate(date ? new Date(date) : undefined); // Force re-render
  }

  const isSelectedDateWeekend = date ? isWeekend(date) : false;

  if (!isClient) {
    return null; // or a skeleton loader
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
         <CardHeader>
            <CardTitle className="font-headline">Your Calendar</CardTitle>
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
            {selectedSummary || selectedReminders.length > 0 || selectedChecklists.length > 0 ? (
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
                            <p className="flex items-center gap-2">Tribe ID: <Badge variant="outline" className="bg-background/20 border-background/50">{selectedSummary.meetupDetails.tribeId}</Badge></p>
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
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteChecklist(checklist.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-1 pl-8">
                           {checklist.items.map(item => (
                               <div key={item.id} className="flex items-center gap-2">
                                   <Checkbox 
                                       id={`${checklist.id}-${item.id}`} 
                                       checked={item.completed}
                                       onCheckedChange={() => toggleChecklistItem(checklist.id, item.id)}
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
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteReminder(reminder.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                
                {selectedSummary && selectedSummary.summary && (
                    <>
                        <div className="flex justify-between items-start pt-4 border-t">
                        <div>
                            <h3 className="font-semibold">Journal Summary</h3>
                            <p className="text-sm text-muted-foreground italic">
                            "{selectedSummary.summary}"
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={handleEdit}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">Vibe</h3>
                            <p className="text-2xl">{selectedSummary.mood}</p>
                        </div>
                        
                        {selectedSummary.hobbies && selectedSummary.hobbies.length > 0 && (
                            <div>
                                <h3 className="font-semibold">Hobbies</h3>
                                <div className="flex gap-2 items-center">
                                    {selectedSummary.hobbies.map((hobby, index) => (
                                        <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                                            <hobby.icon className="h-4 w-4" />
                                            <span>{hobby.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
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
