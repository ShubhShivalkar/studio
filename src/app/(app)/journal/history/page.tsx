"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getAllJournalEntries, deleteJournalEntry } from "@/services/journal-service";
import { format } from "date-fns";
import type { DailySummary } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function JournalHistoryPage() {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<DailySummary[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DailySummary | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("JournalHistoryPage: User object changed:", user);
    if (user) {
      fetchJournalEntries();
    } else {
      console.log("JournalHistoryPage: User not authenticated, not fetching entries.");
      setJournalEntries([]); // Clear entries if user logs out
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (user) {
      console.log("JournalHistoryPage: Fetching journal entries for user:", user.uid);
      try {
        const entries = await getAllJournalEntries(user.uid);
        console.log("JournalHistoryPage: Fetched entries:", entries);
        setJournalEntries(entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("JournalHistoryPage: Error fetching journal entries:", error);
        setJournalEntries([]);
      }
    }
  };

  const truncateText = (text: string, wordLimit: number) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const handleViewFullEntry = (entry: DailySummary) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = async () => {
    if (selectedEntry?.id) {
      try {
        await deleteJournalEntry(selectedEntry.id);
        setIsDialogOpen(false); // Close the view dialog
        setSelectedEntry(null); // Clear selected entry
        fetchJournalEntries(); // Refresh the list of entries
        console.log(`Journal entry with ID ${selectedEntry.id} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting journal entry:", error);
      }
    }
  };

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="absolute top-4 left-4"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center justify-center text-center">
          <CardTitle>Journal History</CardTitle>
          <CardDescription>View all your past journal entries.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto">
        {journalEntries.length === 0 ? (
          <p className="text-center text-muted-foreground">No journal entries found.</p>
        ) : (
          <div className="grid gap-4">
            {journalEntries.map((entry) => (
              <Card key={entry.id} className="cursor-pointer hover:bg-accent" onClick={() => handleViewFullEntry(entry)}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">{format(new Date(entry.date), "EEEE, MMMM d, yyyy")}</p>
                  {entry.mood && <p className="text-xl mb-2">Mood: {entry.mood}</p>}
                  <p className="whitespace-pre-wrap">{truncateText(entry.summary || '', 15)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEntry ? format(new Date(selectedEntry.date), "EEEE, MMMM d, yyyy") : ""}</DialogTitle>
            {selectedEntry?.mood && <DialogDescription>Mood: {selectedEntry.mood}</DialogDescription>}
          </DialogHeader>
          <p className="whitespace-pre-wrap mt-4 flex-1 overflow-y-auto max-h-[300px]">{selectedEntry?.summary}</p>
          <DialogFooter className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Entry
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your journal entry for {selectedEntry ? format(new Date(selectedEntry.date), "EEEE, MMMM d, yyyy") : "this date"}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteEntry} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, delete entry
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
