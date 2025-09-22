"use client";

import { useState, useEffect, useMemo } from "react";
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
    if (user) {
      fetchJournalEntries();
    } else {
      setJournalEntries([]);
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (user) {
      try {
        const entries = await getAllJournalEntries(user.uid);
        setJournalEntries(entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error("JournalHistoryPage: Error fetching journal entries:", error);
        setJournalEntries([]);
      }
    }
  };

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, DailySummary[]>();
    journalEntries.forEach(entry => {
      const dateKey = format(new Date(entry.date), 'yyyy-MM-dd');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      // Sort entries within each day by time (ascending) to maintain chronological order
      groups.get(dateKey)?.push(entry);
    });
    // Sort entries within each day by time (ascending)
    Array.from(groups.values()).forEach(entries => {
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return Array.from(groups.entries());
  }, [journalEntries]);

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
        setIsDialogOpen(false); 
        setSelectedEntry(null); 
        fetchJournalEntries(); 
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
          <div className="grid gap-6">
            {groupedEntries.map(([dateKey, entries]) => (
              <div key={dateKey} className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3 sticky top-0 bg-background z-10">
                  {format(new Date(dateKey), "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="grid gap-4">
                  {entries.map((entry) => (
                    <Card key={entry.id} className="cursor-pointer hover:bg-accent" onClick={() => handleViewFullEntry(entry)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-sm text-muted-foreground">
                                {entry.title && <span className="font-bold mr-2">{entry.title}</span>}
                                {format(new Date(entry.date), "h:mm a")}
                            </p>
                            {entry.mood && <span className="text-xl">{entry.mood}</span>}
                        </div>
                        {entry.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={entry.image} alt={entry.title || "Journal entry image"} className="w-full h-auto rounded-md mb-2" />
                        )}
                        <p className="whitespace-pre-wrap">{truncateText(entry.summary || '', 15)}</p>
                        {entry.collectionTag && (
                            <p className="text-xs text-blue-500 mt-2">#{entry.collectionTag}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
                {selectedEntry?.title && <span className="font-bold mr-2">{selectedEntry.title} - </span>}
                {selectedEntry ? format(new Date(selectedEntry.date), "EEEE, MMMM d, yyyy - h:mm a") : ""}
            </DialogTitle>
            {selectedEntry?.mood && <DialogDescription>Mood: {selectedEntry.mood}</DialogDescription>}
            {selectedEntry?.collectionTag && <DialogDescription>Collection: #{selectedEntry.collectionTag}</DialogDescription>}
          </DialogHeader>
          {selectedEntry?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedEntry.image} alt={selectedEntry.title || "Journal entry image"} className="w-full h-auto rounded-md mb-4" />
          )}
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
                    This action cannot be undone. This will permanently delete your journal entry from {selectedEntry ? format(new Date(selectedEntry.date), "EEEE, MMMM d, yyyy h:mm a") : ""}.
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
