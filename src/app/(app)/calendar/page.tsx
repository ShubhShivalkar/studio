
"use client";

import { useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dailySummaries } from "@/lib/mock-data";
import type { DailySummary } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function DayCellContent({ date }: { date: Date }) {
    const dayData = dailySummaries.find(d => isSameDay(parseISO(d.date), date));
  
    if (!dayData) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {format(date, 'd')}
        </div>
      );
    }
  
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center p-1">
        <span>{format(date, 'd')}</span>
        <div className="flex text-xs gap-1 mt-1 absolute bottom-1">
          <span>{dayData.mood}</span>
          {dayData.hobbies.map((hobby, index) => (
            <hobby.icon key={index} className="w-3 h-3 text-muted-foreground" />
          ))}
          {dayData.hasMeetup && <span>☕️</span>}
          {dayData.isAvailable && !dayData.hasMeetup && <span>❤️</span>}
        </div>
      </div>
    );
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(null);
  const { toast } = useToast();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const summary = dailySummaries.find(d => isSameDay(parseISO(d.date), selectedDate)) || null;
      setSelectedSummary(summary);
    } else {
      setSelectedSummary(null);
    }
  };

  const handleEdit = () => {
    if (!selectedSummary) return;
    toast({
        title: "Editing Summary",
        description: `Editing entry for ${selectedSummary.date}. (Functionality not implemented)`
    })
  }
  
  const handleDelete = () => {
    if (!selectedSummary) return;
    // In a real app, you would call an API to delete the entry.
    // For now, we just show a toast.
    toast({
        variant: "destructive",
        title: "Deleted Summary",
        description: `Entry for ${selectedSummary.date} has been deleted. (Frontend only)`
    })
    setSelectedSummary(null); 
  }

  return (
    <div className="grid gap-6 md:grid-cols-3 h-full">
      <Card className="md:col-span-2">
        <CardContent className="p-2 md:p-6 flex justify-center items-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="w-full"
            classNames={{
                cell: "h-16 w-full text-center",
                day: cn(
                    "w-full h-full rounded-md",
                    "hover:bg-accent/50 transition-colors"
                ),
            }}
            components={{
              DayContent: DayCellContent,
            }}
          />
        </CardContent>
      </Card>
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">
              {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription>
              Your summary and insights for the selected day.
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[12rem] space-y-4">
            {selectedSummary ? (
              <div>
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

                <div className="mt-4">
                    <h3 className="font-semibold">Vibe</h3>
                    <p className="text-2xl">{selectedSummary.mood}</p>
                </div>
                
                {selectedSummary.hobbies.length > 0 && (
                     <div className="mt-4">
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
                
                <div className="mt-4">
                    <h3 className="font-semibold">Availability</h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedSummary.hasMeetup ? "Scheduled meetup ☕️" : selectedSummary.isAvailable ? "Available to meet ❤️" : "Not available"}
                    </p>
                </div>

              </div>
            ) : (
              <div className="text-center text-muted-foreground pt-8">
                <p>No summary for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
