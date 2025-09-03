
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@/lib/mock-data";
import { Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function TribePage() {
  const [tribeState, setTribeState] = useState<"loading" | "no-persona" | "not-interested" | "finding" | "found">("loading");

  useEffect(() => {
    const checkUserStatus = () => {
      if (!currentUser.persona) {
        setTribeState("no-persona");
      } else if (!currentUser.interestedInMeetups) {
        setTribeState("not-interested");
      } else {
        // Here we would run the matching logic. For now, we'll simulate it.
        // This will be replaced with the complex matching logic next.
        setTimeout(() => {
            setTribeState("finding");
        }, 1500);
      }
    };

    checkUserStatus();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meet Your Tribe</CardTitle>
        <CardDescription>
          Connect with like-minded people based on your personality.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[30rem] flex items-center justify-center">
        {tribeState === "loading" && (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/4 mx-auto" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}
        
        {tribeState === "no-persona" && (
           <div className="text-center text-muted-foreground p-4 rounded-md flex flex-col items-center gap-4">
                <Bot className="h-12 w-12" />
                <p className="max-w-md">You need to generate your persona before you can find a tribe. Your persona helps us find the best matches for you.</p>
                <Button asChild>
                    <Link href="/profile">Generate Persona</Link>
                </Button>
            </div>
        )}

        {tribeState === "not-interested" && (
           <div className="text-center text-muted-foreground p-4 rounded-md flex flex-col items-center gap-4">
                <Users className="h-12 w-12" />
                <p className="max-w-md">You've opted out of tribe meetups. To start finding tribes, enable the "Interested in meeting new people" option on your profile.</p>
                <Button asChild variant="secondary">
                    <Link href="/profile">Go to Profile</Link>
                </Button>
            </div>
        )}

        {tribeState === "finding" && (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
                <Users className="h-12 w-12 mb-4 animate-pulse" />
                <p className="font-semibold text-lg">Finding the best tribe for you...</p>
                <p className="text-sm max-w-sm">We're comparing personas, checking availability, and balancing groups to create a meaningful connection.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
