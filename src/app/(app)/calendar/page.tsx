
"use client";

import { useState } from 'react';
import { format, isSameDay, parseISO, isWeekend } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { dailySummaries } from "@/lib/mock-data";
import type { DailySummary } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DayContent, DayContentProps } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function CustomDayContent(props: DayContentProps) {
    const dayData = dailySummaries.find(d => isSameDay(parseISO(d.date), props.date));

    if (props.displayMonth.getMonth() !== props.date.getMonth()) {
      return <DayContent {...props} />;
    }
  
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-start p-1">
        <p>{format(props.date, 'd')}</p>
        {dayData && (
          <div className="flex text-xs md:text-sm gap-1 mt-1 absolute bottom-2 items-center">
            <span>{dayData.mood}</span>
            {dayData.hobbies.map((hobby, index) => (
              <hobby.icon key={index} className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            ))}
            {dayData.hasMeetup && <span>☕️</span>}
            {dayData.isAvailable && !dayData.hasMeetup && <span>❤️</span>}
          </div>
        )}
      </div>
    );
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAvailableForTribe, setIsAvailableForTribe] = useState(false);
  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const summary = dailySummaries.find(d => isSameDay(parseISO(d.date), selectedDate)) || null;
      setSelectedSummary(summary);
      setIsAvailableForTribe(summary?.isAvailable || false);
      setIsSheetOpen(true);
    } else {
      setSelectedSummary(null);
      setIsSheetOpen(false);
    }
  };

  const handleAvailabilityChange = (checked: boolean) => {
    setIsAvailableForTribe(checked);
    if (selectedSummary) {
        // In a real app, you'd update this in your backend.
        // For now, we just show a toast.
        toast({
            title: "Availability Updated",
            description: `You are now marked as ${checked ? 'available' : 'unavailable'} for tribe meetups on this day.`
        });
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
    if (!selectedSummary) return;
    toast({
        variant: "destructive",
        title: "Deleted Summary",
        description: `Entry for ${selectedSummary.date} has been deleted. (Frontend only)`
    })
    setIsSheetOpen(false);
    setSelectedSummary(null); 
  }

  const isSelectedDateWeekend = date ? isWeekend(date) : false;

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-2 md:p-6">
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
                  "[&:nth-child(7n)]:border-r-0", // Last cell in each row
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
              Your summary and insights for the selected day.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {selectedSummary ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Summary</h3>
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
                
                {selectedSummary.hobbies.length > 0 && (
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
                
                <div>
                    <h3 className="font-semibold">Availability</h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedSummary.hasMeetup ? "Scheduled meetup ☕️" : selectedSummary.isAvailable ? "Available to meet ❤️" : "Not available"}
                    </p>
                </div>
                
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
                            />
                        </div>
                    </div>
                )}

              </div>
            ) : (
              <div className="text-center text-muted-foreground pt-8">
                <p>No summary for this day.</p>
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

    