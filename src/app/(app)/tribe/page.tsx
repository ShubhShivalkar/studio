
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
import { Bot, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/types";
import { differenceInYears, parseISO, format } from "date-fns";
import type { MatchUsersByPersonalityOutput } from "@/ai/flows/match-users-by-personality";
import { ProfileCard } from "@/components/profile-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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

const staticTribe: Tribe = {
    id: 'tribe-static-123',
    meetupDate: '2025-09-06',
    location: '70 Beans Cafe, Navi Mumbai',
    members: [
        {
            userId: currentUser.id,
            compatibilityScore: 100,
            persona: currentUser.persona || "This is you!",
            user: currentUser,
            matchReason: "This is you!"
        },
        {
            userId: allUsers[0].id,
            compatibilityScore: 92,
            persona: allUsers[0].persona!,
            user: allUsers[0],
            matchReason: "High compatibility based on shared interests in creative pursuits and introspective activities."
        },
        {
            userId: allUsers[1].id,
            compatibilityScore: 88,
            persona: allUsers[1].persona!,
            user: allUsers[1],
            matchReason: "Strong alignment in valuing quiet moments, nature, and deep conversations."
        },
        {
            userId: allUsers[2].id,
            compatibilityScore: 85,
            persona: allUsers[2].persona!,
            user: allUsers[2],
            matchReason: "You both share a love for learning new things and expressing creativity, suggesting great conversations."
        },
    ]
};


export default function TribePage() {
  const [tribeState, setTribeState] = useState<"loading" | "no-persona" | "not-interested" | "finding" | "found">("loading");
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for persona and interest first
    if (!currentUser.persona) {
        setTribeState("no-persona");
        return;
    }
    if (!currentUser.interestedInMeetups) {
        setTribeState("not-interested");
        return;
    }

    // Directly set the static tribe
    setTribe(staticTribe);
    setTribeState("found");
  }, []);

  const handleReport = (userName: string) => {
    toast({
        variant: "destructive",
        title: "User Reported",
        description: `Thank you for your feedback. We have received your report for ${userName} and will review it.`
    })
  }

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                                        <AvatarImage src={member.user.avatar} alt={member.user.name} data-ai-hint="person photo"/>
                                        <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <DialogTitle className="font-headline">{member.user.name}</DialogTitle>
                                    <DialogDescription>{member.user.gender}, Born {format(parseISO(member.user.dob), 'MMMM d, yyyy')} ({getAge(member.user.dob)} years old)</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold">Persona Summary</h3>
                                        <p className="text-sm text-muted-foreground italic">"{member.persona}"</p>
                                    </div>
                                    
                                     {member.user.hobbies && member.user.hobbies.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Hobbies</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {member.user.hobbies.map((hobby, index) => (
                                                    <Badge key={index} variant="secondary">{hobby}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {member.user.interests && member.user.interests.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Interests</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {member.user.interests.map((interest, index) => (
                                                    <Badge key={index} variant="secondary">{interest}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                     <div>
                                        <h3 className="font-semibold">Why you're a good match</h3>
                                        <p className="text-sm text-muted-foreground">{member.matchReason}</p>
                                    </div>
                                </div>
                                { member.user.id !== currentUser.id && (
                                     <DialogFooter className="pt-4">
                                        <Button variant="outline" size="sm" onClick={() => handleReport(member.user.name)}>
                                            <ShieldAlert className="h-4 w-4 mr-2" />
                                            Report User
                                        </Button>
                                     </DialogFooter>
                                )}
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
