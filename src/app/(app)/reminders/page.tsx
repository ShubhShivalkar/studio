
"use client";

import { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { getReminders, createReminder, deleteReminder } from "@/services/reminder-service";
import type { Reminder } from "@/lib/types";

export default function RemindersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [remindersList, setRemindersList] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    async function fetchReminders() {
      if (!user) return;
      setIsLoading(true);
      try {
        const reminders = await getReminders(user.uid);
        setRemindersList(reminders);
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load your reminders." });
      } finally {
        setIsLoading(false);
      }
    }
    fetchReminders();
  }, [user, toast]);

  const handleSetReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const formData = new FormData(event.currentTarget);
    const newReminderData = {
        title: formData.get("title") as string,
        date: formData.get("date") as string,
        time: formData.get("time") as string,
        details: formData.get("details") as string,
    };
    
    try {
      const newReminder = await createReminder(user.uid, newReminderData);
      setRemindersList(prev => [...prev, newReminder]);
      toast({
        title: "Reminder Set!",
        description: `We'll remind you about "${newReminder.title}".`,
      });
      setIsDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Failed to create reminder:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not save your reminder." });
    }
  };
  
  const handleDeleteReminder = async (reminderId: string) => {
    if(!user) return;
    const originalReminders = [...remindersList];
    const reminderToDelete = remindersList.find(r => r.id === reminderId);
    
    // Optimistic UI update
    setRemindersList(prev => prev.filter(r => r.id !== reminderId));

    try {
      await deleteReminder(reminderId);
      toast({
          variant: "destructive",
          title: "Reminder Deleted",
          description: `"${reminderToDelete?.title}" has been removed.`
      });
    } catch(error) {
       console.error("Failed to delete reminder:", error);
       setRemindersList(originalReminders); // Revert on error
       toast({ variant: 'destructive', title: 'Error', description: 'Could not delete reminder.' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Your Reminders</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
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
                            <Input id="date" name="date" type="date" className="col-span-3" defaultValue={new Date().toISOString().split('T')[0]} required />
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
                        <Button type="submit">Set Reminder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="text-center text-muted-foreground py-16">Loading reminders...</div>
        ) : remindersList.length > 0 ? (
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
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => handleDeleteReminder(reminder.id!)}>
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
      </CardContent>
    </Card>
  );
}
