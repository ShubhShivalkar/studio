
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { allUsers, currentUser, dailySummaries } from "@/lib/mock-data";
import { Bot, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { differenceInYears, parseISO } from "date-fns";
import { matchUsersByPersonality, type MatchUsersByPersonalityOutput } from "@/ai/flows/match-users-by-personality";
import { ProfileCard } from "@/components/profile-card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


type MatchedUser = MatchUsersByPersonalityOutput[0] & {
  user: User;
  matchReason: string;
};

type Tribe = {
    id: string;
    members: MatchedUser[];
    meetupDate: string;
    location: string;
}

const getAge = (dob: string) => differenceInYears(new Date(), parseISO(dob));

export default function TribePage() {
  const [tribeState, setTribeState] = useState<"loading" | "no-persona" | "not-interested" | "finding" | "found">("loading");
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const runMatchingLogic = async () => {
      if (!currentUser.persona) {
        setTribeState("no-persona");
        return;
      }
      if (!currentUser.interestedInMeetups) {
        setTribeState("not-interested");
        return;
      }

      setTribeState("finding");

      try {
        // 1. Find common availability
        const userAvailableDates = new Set(
          dailySummaries
            .filter(d => d.isAvailable && d.date.startsWith(new Date().toISOString().substring(0, 7))) // Check current month
            .map(d => d.date)
        );
        
        if (userAvailableDates.size === 0) {
            setTribe(null);
            setTribeState("finding"); // Keep showing finding if no availability
            return;
        }

        const otherUsersWithAvailability = allUsers
            .filter(u => u.id !== currentUser.id && u.interestedInMeetups)
            .map(u => ({
                ...u,
                availableDates: u.availableDates?.filter(d => userAvailableDates.has(d)) || []
            }))
            .filter(u => u.availableDates.length > 0);

        const bestMeetupDate = Array.from(userAvailableDates)[0]; // Simplistic: pick the first common date

        // 2. Filter by Age
        const currentUserAge = getAge(currentUser.dob);
        const ageFilteredUsers = otherUsersWithAvailability.filter(u => {
            const userAge = getAge(u.dob);
            return Math.abs(currentUserAge - userAge) <= 2;
        });

        if(ageFilteredUsers.length < 3){ // Need at least 3 others for a tribe of 4
            setTribe(null);
            setTribeState("finding");
            return;
        }

        // 3. Call AI for Persona Matching
        const personasToMatch = ageFilteredUsers.map(u => `${u.id}::${u.persona}`);
        const matches = await matchUsersByPersonality({
            userPersona: currentUser.persona,
            otherUserPersonas: personasToMatch
        });
        
        // 4. Filter by score and add user object back
        const highScoringMatches = matches
            .filter(m => m.compatibilityScore > 75)
            .map(match => {
                const user = ageFilteredUsers.find(u => u.id === match.userId)!;
                return { 
                    ...match, 
                    user,
                    matchReason: `High compatibility (${match.compatibilityScore}%) based on shared interests in creative pursuits and introspective activities.` // Example reason
                };
            });

        // 5. Assemble Tribe with 1:1 Gender Ratio
        let maleMatches = highScoringMatches.filter(m => m.user.gender === 'Male');
        let femaleMatches = highScoringMatches.filter(m => m.user.gender === 'Female');
        
        const finalTribeMembers: MatchedUser[] = [];
        const maxMembersPerGender = Math.min(maleMatches.length, femaleMatches.length, 5); // up to 10 members total

        if (maxMembersPerGender > 1) { // Need at least 2 of each gender to form a group of 4+
            if (currentUser.gender === 'Male') {
                finalTribeMembers.push(...maleMatches.slice(0, maxMembersPerGender -1));
                finalTribeMembers.push(...femaleMatches.slice(0, maxMembersPerGender));
            } else {
                finalTribeMembers.push(...maleMatches.slice(0, maxMembersPerGender));
                finalTribeMembers.push(...femaleMatches.slice(0, maxMembersPerGender -1));
            }

            // Add current user to their own tribe object for display
             const currentUserForTribe: MatchedUser = {
                userId: currentUser.id,
                compatibilityScore: 100,
                persona: currentUser.persona,
                user: currentUser,
                matchReason: "This is you!"
            };
            
            finalTribeMembers.push(currentUserForTribe);
            finalTribeMembers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        }

        if (finalTribeMembers.length >= 4 && finalTribeMembers.length <= 10) {
             setTribe({
                id: `tribe-${Date.now()}`,
                members: finalTribeMembers,
                meetupDate: bestMeetupDate,
                location: "70 Beans Cafe, Navi Mumbai"
            });
            setTribeState("found");
        } else {
            setTribe(null);
            setTribeState("finding");
        }
      } catch (error) {
        console.error("Tribe matching failed:", error);
        toast({ variant: "destructive", title: "Could not find a tribe", description: "An error occurred during matching. Please try again later." });
        setTribeState("finding"); // Keep it on finding state on error
      }
    };

    runMatchingLogic();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meet Your Tribe</CardTitle>
        <CardDescription>
          Connect with like-minded people based on your personality, availability, and age.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[30rem] flex items-center justify-center p-2 sm:p-6">
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

        {tribeState === "found" && tribe && (
            <div className="w-full">
                 <Card className="mb-6 bg-secondary">
                    <CardHeader>
                        <CardTitle className="font-headline text-center">Your Tribe is Ready!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                        <p><strong>Meetup Date:</strong> {new Date(tribe.meetupDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Location:</strong> {tribe.location}</p>
                        <p className="text-xs text-muted-foreground">Tribe ID: {tribe.id}</p>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tribe.members.map(member => (
                        <Dialog key={member.userId}>
                            <DialogTrigger asChild>
                                <div className="cursor-pointer">
                                    <ProfileCard user={member.user} compatibilityScore={member.compatibilityScore} />
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader className="items-center">
                                    <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                                        <AvatarImage src={member.user.avatar} alt={member.user.name} />
                                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <DialogTitle className="font-headline">{member.user.name}</DialogTitle>
                                    <DialogDescription>{member.user.gender}, {getAge(member.user.dob)} years old</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold">Persona Summary</h3>
                                        <p className="text-sm text-muted-foreground italic">"{member.persona}"</p>
                                    </div>
                                     <div>
                                        <h3 className="font-semibold">Why you're a good match</h3>
                                        <p className="text-sm text-muted-foreground">{member.matchReason}</p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
