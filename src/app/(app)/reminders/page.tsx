
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
import { Plus } from "lucide-react";

export default function RemindersPage() {
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSetReminder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get("title") as string;
    
    // In a real app, you would save this to a backend.
    toast({
      title: "Reminder Set!",
      description: `We'll remind you about "${title}". (Functionality not implemented)`,
    });
  };

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

      <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
        <p>You have no upcoming reminders.</p>
        <p className="text-sm">Click "Set Reminder" to add a new one.</p>
      </div>
    </div>
  );
}
