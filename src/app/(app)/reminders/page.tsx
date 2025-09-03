
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2 } from "lucide-react";
import { reminders } from "@/lib/mock-data";
import { format } from "date-fns";

export default function RemindersPage() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remindersList, setRemindersList] = useState(reminders);

  const handleSetReminder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newReminder = {
        id: `rem-${Date.now()}`,
        title: formData.get("title") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        details: formData.get("details") as string,
    };
    
    // In a real app, you would save this to a backend.
    reminders.push(newReminder);
    setRemindersList([...reminders]);

    toast({
      title: "Reminder Set!",
      description: `We'll remind you about "${newReminder.title}".`,
    });
  };
  
  const handleDeleteReminder = (reminderId: string) => {
    const reminderToDelete = remindersList.find(r => r.id === reminderId);
    if (!reminderToDelete) return;

    // In a real app, this would be an API call
    const newReminders = remindersList.filter((reminder) => reminder.id !== reminderId);
    reminders.splice(0, reminders.length, ...newReminders); // Update mock data source
    setRemindersList(newReminders);

    toast({
        variant: "destructive",
        title: "Reminder Deleted",
        description: `"${reminderToDelete.title}" has been removed.`
    });
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-headline">Your Reminders</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Set Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Set a new reminder</DialogTitle>
              <DialogDescription>
                Fill in the details for your new reminder below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSetReminder}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                        Title
                        </Label>
                        <Input id="title" name="title" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                        Date
                        </Label>
                        <Input id="date" name="date" type="date" className="col-span-3" defaultValue={date} required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                        Time
                        </Label>
                        <Input id="time" name="time" type="time" className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="details" className="text-right">
                        Details
                        </Label>
                        <Textarea id="details" name="details" className="col-span-3" placeholder="Optional details..."/>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                      <Button type="submit">Set Reminder</Button>
                    </DialogClose>
                </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {remindersList.length > 0 ? (
        <div className="space-y-4">
            {remindersList.map((reminder) => (
                <div key={reminder.id} className="p-4 border rounded-lg flex items-start gap-4">
                    <Bell className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-grow">
                        <h3 className="font-semibold">{reminder.title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {format(new Date(`${reminder.date}T${reminder.time}`), 'MMMM d, yyyy')} at {format(new Date(`${reminder.date}T${reminder.time}`), 'p')}
                        </p>
                        {reminder.details && <p className="text-sm mt-1">{reminder.details}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <p>You have no upcoming reminders.</p>
            <p className="text-sm">Click "Set Reminder" to add a new one.</p>
        </div>
      )}
    </div>
  );
}

    