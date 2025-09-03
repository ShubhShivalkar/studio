
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { allUsers, currentUser } from "@/lib/mock-data";
import { Bot, Users, ShieldAlert, CheckCircle, XCircle, MessageSquare, Info } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type MatchedUser = MatchUsersByPersonalityOutput[0] & {
  user: User;
  matchReason: string;
  rsvpStatus: 'accepted' | 'rejected';
  rejectionReason?: string;
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
            matchReason: "This is you!",
            rsvpStatus: 'accepted',
        },
        {
            userId: allUsers[0].id,
            compatibilityScore: 92,
            persona: allUsers[0].persona!,
            user: allUsers[0],
            matchReason: "High compatibility based on shared interests in creative pursuits and introspective activities.",
            rsvpStatus: 'accepted',
        },
        {
            userId: allUsers[1].id,
            compatibilityScore: 88,
            persona: allUsers[1].persona!,
            user: allUsers[1],
            matchReason: "Strong alignment in valuing quiet moments, nature, and deep conversations.",
            rsvpStatus: 'rejected',
            rejectionReason: "Sorry, I have a family event that weekend I can't miss. Hope to catch the next one!",
        },
        {
            userId: allUsers[2].id,
            compatibilityScore: 85,
            persona: allUsers[2].persona!,
            user: allUsers[2],
            matchReason: "You both share a love for learning new things and expressing creativity, suggesting great conversations.",
            rsvpStatus: 'accepted',
        },
    ]
};


export default function TribePage() {
  const [tribeState, setTribeState] = useState<"loading" | "no-persona" | "not-interested" | "finding" | "found">("loading");
  const [tribe, setTribe] = useState<Tribe | null>(null);
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);

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
  
  const handleRsvp = (status: 'accepted' | 'rejected') => {
    if (!tribe) return;

    if (status === 'rejected') {
        setIsDeclineDialogOpen(true);
        return;
    }
    
    // Handle 'accepted'
    const updatedMembers = tribe.members.map(member => 
        member.userId === currentUser.id ? { ...member, rsvpStatus: 'accepted', rejectionReason: undefined } : member
    );
    setTribe({ ...tribe, members: updatedMembers });
    toast({ title: "RSVP Confirmed!", description: "You've accepted the invitation. See you there!" });
  }

  const handleDeclineSubmit = () => {
    if (!tribe || !rejectionReason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please provide a reason for declining." });
      return;
    }
    const updatedMembers = tribe.members.map(member => 
        member.userId === currentUser.id ? { ...member, rsvpStatus: 'rejected', rejectionReason: rejectionReason } : member
    );
    setTribe({ ...tribe, members: updatedMembers });
    toast({ title: "RSVP Updated", description: "You have declined the invitation." });
    setRejectionReason("");
    setIsDeclineDialogOpen(false);
  }

  const handleReport = (userName: string) => {
    toast({
        variant: "destructive",
        title: "User Reported",
        description: `Thank you for your feedback. We have received your report for ${userName} and will review it.`
    })
  }
  
  const currentUserRsvp = tribe?.members.find(m => m.userId === currentUser.id)?.rsvpStatus;

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
                        <CardDescription className="text-center">You've been invited to a meetup.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-2">
                        <p><strong>Meetup Date:</strong> {new Date(tribe.meetupDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Location:</strong> {tribe.location}</p>
                        <div className="text-sm text-muted-foreground">Show this Tribe ID at the cafe: <Badge variant="outline">{tribe.id}</Badge></div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-4">
                       <p className="text-sm font-medium">Your RSVP:</p>
                        <div className="flex gap-2">
                           <Button 
                             size="sm" 
                             onClick={() => handleRsvp('accepted')} 
                             disabled={currentUserRsvp === 'accepted'}
                             variant={currentUserRsvp === 'accepted' ? 'default' : 'outline'}
                            >
                               <CheckCircle className="mr-2" /> Accept
                           </Button>
                           <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                               <DialogTrigger asChild>
                                   <Button 
                                       size="sm" 
                                       variant={currentUserRsvp === 'rejected' ? 'destructive' : 'outline'}
                                       onClick={() => handleRsvp('rejected')}
                                   >
                                       <XCircle className="mr-2"/> Decline
                                   </Button>
                               </DialogTrigger>
                               <DialogContent>
                                   <DialogHeader>
                                       <DialogTitle>Decline Invitation</DialogTitle>
                                       <DialogDescription>Please provide a reason for declining. This will be shared with the rest of your tribe.</DialogDescription>
                                   </DialogHeader>
                                   <Textarea 
                                     placeholder="E.g., Sorry, I have a prior commitment."
                                     value={rejectionReason}
                                     onChange={(e) => setRejectionReason(e.target.value)}
                                   />
                                   <DialogFooter>
                                       <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>Cancel</Button>
                                       <Button variant="destructive" onClick={handleDeclineSubmit}>Submit</Button>
                                   </DialogFooter>
                               </DialogContent>
                           </Dialog>
                        </div>
                    </CardFooter>
                </Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tribe.members.map(member => (
                        <Dialog key={member.userId}>
                            <DialogTrigger asChild>
                                <div className="cursor-pointer">
                                    <ProfileCard 
                                        user={member.user} 
                                        compatibilityScore={member.compatibilityScore}
                                        rsvpStatus={member.rsvpStatus}
                                    />
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
                                     <Badge variant={member.rsvpStatus === 'accepted' ? 'secondary' : 'destructive'}>
                                        {member.rsvpStatus === 'accepted' ? <CheckCircle className="mr-1.5" /> : <XCircle className="mr-1.5" />}
                                        {member.rsvpStatus === 'accepted' ? 'Attending' : 'Not Attending'}
                                    </Badge>
                                </DialogHeader>
                                <div className="space-y-4">
                                     {member.rsvpStatus === 'rejected' && member.rejectionReason && (
                                        <div className="p-3 bg-destructive/10 rounded-md text-sm">
                                            <p className="font-semibold text-destructive flex items-center gap-2"><MessageSquare /> Reason for declining:</p>
                                            <p className="text-destructive/80 italic">"{member.rejectionReason}"</p>
                                        </div>
                                    )}

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
                 <Alert className="mt-6">
                    <Info className="h-4 w-4"/>
                    <AlertTitle>Tribe Lock-in</AlertTitle>
                    <AlertDescription>
                        Once your RSVP is set, you are part of this tribe for the week. New tribes are formed every other Monday, so you won't be able to join another one until then.
                    </AlertDescription>
                </Alert>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
