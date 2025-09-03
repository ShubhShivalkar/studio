
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { allUsers, currentUser } from "@/lib/mock-data";
import { matchUsersByPersonality } from "@/ai/flows/match-users-by-personality";
import type { User } from "@/lib/types";
import { ProfileCard } from "@/components/profile-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users } from "lucide-react";

type MatchedUser = User & {
  compatibilityScore?: number;
};

export default function TribePage() {
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const findMatches = async () => {
      setIsLoading(true);
      setError(null);

      if (!currentUser.persona) {
        setError("You need to generate your persona on the Profile page first.");
        setIsLoading(false);
        return;
      }
      
      const otherUserPersonas = allUsers
        .filter(u => u.id !== currentUser.id && u.persona)
        .map(u => `${u.id}::${u.persona}`); // Pass ID with persona

      if (otherUserPersonas.length === 0) {
        setError("No other users with personas are available to match with at the moment.");
        setIsLoading(false);
        return;
      }

      try {
        const matches = await matchUsersByPersonality({
          userPersona: currentUser.persona,
          otherUserPersonas: otherUserPersonas,
        });

        const enrichedMatches = matches
            .map(match => {
                const user = allUsers.find(u => u.id === match.userId);
                if (user) {
                    return { ...user, compatibilityScore: match.compatibilityScore };
                }
                return null;
            })
            .filter((user): user is MatchedUser => user !== null);

        setMatchedUsers(enrichedMatches);

      } catch (err) {
        console.error("Failed to find matches:", err);
        setError("Sorry, we couldn't find matches at this time. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    findMatches();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meet Your Tribe</CardTitle>
        <CardDescription>
          Connect with like-minded people based on your personality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
        ) : error ? (
            <div className="text-center text-destructive-foreground bg-destructive/80 p-4 rounded-md">
                <p>{error}</p>
                {error.includes("generate your persona") && (
                    <Button asChild variant="secondary" className="mt-4">
                        <Link href="/profile">Go to Profile</Link>
                    </Button>
                )}
            </div>
        ) : matchedUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {matchedUsers.map((user) => (
              <ProfileCard key={user.id} user={user} compatibilityScore={user.compatibilityScore} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16 flex flex-col items-center">
            <Users className="h-12 w-12 mb-4" />
            <p>No potential matches found at this time.</p>
            <p className="text-sm">Check back later as more users join!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
