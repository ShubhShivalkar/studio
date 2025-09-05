
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
import { Bot, Users, ShieldAlert, CheckCircle, XCircle, MessageSquare, Info, UserX, UserCheck, Heart, History, AlertTriangle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { User, MatchedUser, Tribe } from "@/lib/types";
import { differenceInYears, parseISO, format, isWeekend, differenceInSeconds } from "date-fns";
import { matchUsersByTribePreferences } from "@/ai/flows/match-users-by-tribe-preferences";
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
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useTribeStore from "@/store/tribe";
import { useAuth } from "@/context/auth-context";
import { getJournalEntries } from "@/services/journal-service";
import { getAllUsers } from "@/services/user-service";
import { getTribeScheduleInfo } from "@/services/tribe-service";


const getAge = (dob: string) => {
    if (!dob) return '';
    return differenceInYears(new Date(), parseISO(dob));
}

export default function TribePage() {
  const { profile, loading: authLoading } = useAuth();
  const [tribeState, setTribeState] = useState<"loading" | "no-persona" | "not-interested" | "no-availability" | "finding" | "found" | "no-matches" | "wait-for-monday">("loading");
  const { tribe, setTribe, clearTribe } = useTribeStore();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);
  const [nextMondayFormatted, setNextMondayFormatted] = useState('');
  const [nextMatchDateTime, setNextMatchDateTime] = useState<string | null>(null);

  const calculateTimeLeft = () => {
    if (!nextMatchDateTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const difference = differenceInSeconds(parseISO(nextMatchDateTime), new Date());
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (60 * 60 * 24));
    const hours = Math.floor((difference % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((difference % (60 * 60)) / 60);
    const seconds = Math.floor(difference % 60);
    
    return { days, hours, minutes, seconds };
  };
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!nextMatchDateTime) return;
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [nextMatchDateTime]);


  useEffect(() => {
    const findTribe = async () => {
        if (!profile || authLoading) {
            setTribeState("loading");
            return;
        }

        // --- PRE-CONDITIONS ---
        if (!profile.persona) {
            setTribeState("no-persona");
            return;
        }
        if (!profile.interestedInMeetups) {
            setTribeState("not-interested");
            return;
        }
        
        const journalEntries = await getJournalEntries(profile.id);
        const hasAvailability = journalEntries.some(d => d.isAvailable && new Date(d.date) >= new Date());
        if (!hasAvailability) {
            setTribeState("no-availability");
            return;
        }
        
        // --- WEEKLY CYCLE LOGIC ---
        const scheduleInfo = await getTribeScheduleInfo();
        setNextMondayFormatted(scheduleInfo.nextMondayFormatted);
        setNextMatchDateTime(scheduleInfo.nextMatchDateTime);
        if (!scheduleInfo.isMatchDay) {
            setTribeState("wait-for-monday");
            return;
        }

        setTribeState("finding");
        
        try {
            const allUsers = await getAllUsers();
            
            // TODO: Logic to fill partial tribes first would go here.
            
            const matches = await matchUsersByTribePreferences({
                currentUser: {
                    id: profile.id,
                    name: profile.name,
                    persona: profile.persona,
                    dob: profile.dob,
                    gender: profile.gender,
                    location: profile.location,
                    interestedInMeetups: true,
                    lastActive: profile.lastActive,
                    lastTribeDate: profile.lastTribeDate,
                    journalEntries: profile.journalEntries,
                },
                otherUsers: allUsers,
                preferences: profile.tribePreferences || { ageRange: [18, 60], gender: 'No Preference' }
            });

            const nextAvailableWeekendDay = journalEntries
                .filter(d => d.isAvailable && isWeekend(parseISO(d.date)) && new Date(d.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date;
            
            if (!nextAvailableWeekendDay) {
                setTribeState("no-availability");
                return;
            }

            if (!matches || matches.length < 3) {
                setTribeState("no-matches");
                return;
            }

            // Create a mock tribe with the current user and the matches
            const currentUserAsMatchedUser: MatchedUser = {
                userId: profile.id,
                user: profile,
                compatibilityScore: 100,
                persona: profile.persona,
                matchReason: 'This is you!',
                rsvpStatus: 'pending',
            };

            const matchedUsersWithDetails: MatchedUser[] = matches.map(match => {
                const user = allUsers.find(u => u.id === match.userId);
                return {
                    ...match,
                    user: user!,
                    rsvpStatus: 'pending',
                };
            });
            
            const newTribe: Tribe = {
                id: `tribe-${Date.now()}`,
                members: [currentUserAsMatchedUser, ...matchedUsersWithDetails],
                meetupDate: format(parseISO(nextAvailableWeekendDay), 'yyyy-MM-dd'),
                meetupTime: '3:00 PM',
                location: 'The Cozy Cafe',
            };
            
            setTribe(newTribe);
            setTribeState("found");

        } catch (error) {
            console.error("Error finding tribe:", error);
            setTribeState("no-matches"); // Show an error/retry state
        }
    };
    
    // Using a timeout to simulate the async operation of finding a tribe
    const timer = setTimeout(findTribe, 1500);
    return () => clearTimeout(timer);
    
  }, [profile, authLoading, setTribe]);

  const handleRsvp = (status: 'accepted' | 'rejected') => {
    if (!tribe) return;

    if (status === 'rejected') {
        setIsDeclineDialogOpen(true);
        return;
    }
    
    // Handle 'accepted'
    const updatedMembers = tribe.members.map(member => 
        member.userId === profile?.id ? { ...member, rsvpStatus: 'accepted', rejectionReason: undefined } : member
    );
    setTribe({ ...tribe, members: updatedMembers });
    // TODO: updateCalendarEvent(tribe, true);
    toast({ title: "RSVP Confirmed!", description: "You've accepted the invitation. See you there!" });
  }

  const handleDeclineSubmit = () => {
    if (!tribe || !rejectionReason.trim()) {
      toast({ variant: "destructive", title: "Reason Required", description: "Please provide a reason for declining." });
      return;
    }
    const updatedMembers = tribe.members.map(member => 
        member.userId === profile?.id ? { ...member, rsvpStatus: 'rejected', rejectionReason: rejectionReason } : member
    );
    setTribe({ ...tribe, members: updatedMembers });
    // TODO: updateCalendarEvent(tribe, false);
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
  
  const currentUserData = tribe?.members.find(m => m.userId === profile?.id);
  const currentUserRsvp = currentUserData?.rsvpStatus;

  const attendingMembers = tribe?.members.filter(m => {
    if (m.userId === profile?.id) {
        return currentUserRsvp !== 'rejected';
    }
    return m.rsvpStatus !== 'rejected';
  });
  
  const rejectedMembers = tribe?.members.filter(m => m.rsvpStatus === 'rejected');
  const isTribeComplete = attendingMembers && attendingMembers.length >= 4;

  const CountdownTimer = () => (
    <div className="flex items-center justify-center gap-4">
        <div>
            <span className="font-mono text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground block">DAYS</span>
        </div>
        <div>
            <span className="font-mono text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground block">HOURS</span>
        </div>
        <div>
            <span className="font-mono text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground block">MINUTES</span>
        </div>
        <div>
            <span className="font-mono text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground block">SECONDS</span>
        </div>
    </div>
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <div className="flex items-center gap-2">
                    <CardTitle>Meet Your Tribe</CardTitle>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>New tribes are formed every Monday at 12 PM.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <CardDescription>
                  We'll connect you with people who understand your Vibe
                </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/tribe/history">
                        <History className="mr-2" />
                        History
                    </Link>
                </Button>
            </div>
        </div>
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
        
        {tribeState === "no-availability" && (
             <div className="text-center text-muted-foreground p-4 rounded-md flex flex-col items-center gap-4">
                <CalendarClock className="h-12 w-12" />
                <p className="max-w-md">Please mark your availability for an upcoming weekend on the Calendar page to be considered for a tribe.</p>
                <Button asChild>
                    <Link href="/calendar">Go to Calendar</Link>
                </Button>
            </div>
        )}
        
        {tribeState === "wait-for-monday" && (
            <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-6">
                <CalendarClock className="h-12 w-12" />
                <div>
                  <p className="font-semibold text-lg">Next tribe matching begins in:</p>
                  <p className="text-sm max-w-sm mb-4">
                      We'll run our matching algorithm again on {nextMondayFormatted} at 12 PM.
                  </p>
                </div>
                <CountdownTimer />
            </div>
        )}
        
        {tribeState === "no-matches" && (
             <div className="text-center text-muted-foreground py-16 flex flex-col items-center gap-6">
                <UserX className="h-12 w-12" />
                <div>
                    <p className="font-semibold text-lg">No suitable tribe found this week.</p>
                    <p className="text-sm max-w-sm mb-4">We couldn't find enough compatible members. Please check back next week!</p>
                </div>
                <CountdownTimer />
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
                 {currentUserRsvp === 'rejected' ? (
                     <div className="text-center text-muted-foreground p-4 rounded-md flex flex-col items-center gap-4">
                        <Heart className="h-12 w-12 text-primary" />
                        <p className="max-w-md text-lg">Hey! Don't worry, we'll arrange a new meet up for you at your next availability.</p>
                    </div>
                 ) : (
                    <>
                        <Card className="mb-6 bg-secondary text-secondary-foreground">
                            <CardHeader>
                                <CardTitle className="text-center">
                                    {isTribeComplete ? "Your Tribe is Ready! 🎉" : "Partial Tribe Formed ⏳"}
                                </CardTitle>
                                <CardDescription className="text-center text-secondary-foreground/80">
                                    {isTribeComplete ? "You've been invited to a meetup." : `Waiting for at least one more member to join.`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center space-y-2">
                                {isTribeComplete ? (
                                    <>
                                        <p><strong>Meetup Date:</strong> {new Date(tribe.meetupDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        <p><strong>Meetup Time:</strong> {tribe.meetupTime}</p>
                                        <p><strong>Location:</strong> {tribe.location}</p>
                                        <div className="text-sm text-secondary-foreground/80 pt-2">
                                            Please free your schedule at this time for at least 2 hours.
                                            <br />
                                            Show this Tribe ID at the cafe: <Badge variant="outline" className="bg-background/20 border-background/50">{tribe.id}</Badge>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-secondary-foreground/80">A location and Tribe ID will be assigned once the tribe is complete.</p>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-4">
                               <p className="text-sm font-medium">Your RSVP:</p>
                                <div className="flex gap-2">
                                   <Button 
                                     size="sm" 
                                     onClick={() => handleRsvp('accepted')} 
                                     variant={currentUserRsvp === 'accepted' ? 'default' : 'outline'}
                                     className="bg-white text-primary hover:bg-white/90 border-white"
                                    >
                                       <CheckCircle className="mr-2" /> Accept
                                   </Button>
                                   <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
                                       <DialogTrigger asChild>
                                           <Button 
                                               size="sm" 
                                               variant={currentUserRsvp === 'rejected' ? 'destructive' : 'outline'}
                                               className="bg-transparent text-white hover:bg-white/10 border-white"
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
                                           <div className="space-y-4">
                                                <Textarea 
                                                placeholder="E.g., Sorry, I have a prior commitment."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                />
                                                <Alert variant="destructive">
                                                    <AlertTriangle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        You will not be able to join this tribe again or any other tribe until next Monday.
                                                    </AlertDescription>
                                                </Alert>
                                           </div>
                                           <DialogFooter>
                                               <Button variant="outline" onClick={() => setIsDeclineDialogOpen(false)}>Cancel</Button>
                                               <Button variant="destructive" onClick={handleDeclineSubmit}>Submit</Button>
                                           </DialogFooter>
                                       </DialogContent>
                                   </Dialog>
                                </div>
                            </CardFooter>
                        </Card>

                        <div className="mb-6">
                            <h3 className="text-lg font-headline mb-2 flex items-center gap-2">
                                <UserCheck /> Attending Members ({attendingMembers?.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {attendingMembers?.map(member => (
                                    <Dialog key={member.userId}>
                                        <DialogTrigger asChild>
                                            <div className="cursor-pointer">
                                                <ProfileCard 
                                                    user={member.user} 
                                                    compatibilityScore={member.compatibilityScore}
                                                    rsvpStatus={member.user.id === profile?.id ? 'accepted' : member.rsvpStatus}
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
                                                <DialogDescription>
                                                    {member.user.gender}
                                                    {member.user.dob && `, Born ${format(parseISO(member.user.dob), 'MMMM d, yyyy')} (${getAge(member.user.dob)} years old)`}
                                                </DialogDescription>
                                                <Badge variant={member.rsvpStatus === 'accepted' ? 'secondary' : member.rsvpStatus === 'pending' ? 'outline' : 'destructive'}>
                                                    <CheckCircle className="mr-1.5" />
                                                    Attending
                                                </Badge>
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
                                            { member.user.id !== profile?.id && (
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
                         
                         {rejectedMembers && rejectedMembers.length > 0 && (
                            <div>
                                 <Separator className="my-6" />
                                 <h3 className="text-lg font-headline mb-4 flex items-center gap-2 text-destructive">
                                     <UserX /> Declined ({rejectedMembers.length})
                                 </h3>
                                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                     {rejectedMembers.map(member => (
                                        <Dialog key={member.userId}>
                                            <DialogTrigger asChild>
                                               <div className="flex flex-col items-center gap-2 cursor-pointer group">
                                                   <div className="relative">
                                                       <Avatar className="w-16 h-16 md:w-20 md-h-20 border-2 border-destructive/50 group-hover:border-destructive transition-colors">
                                                            <AvatarImage src={member.user.avatar} alt={member.user.name} />
                                                            <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                                       </Avatar>
                                                       <div className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5">
                                                          <XCircle className="h-4 w-4" />
                                                       </div>
                                                   </div>
                                                    <p className="text-sm font-medium text-center truncate w-full">{member.user.name}</p>
                                               </div>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Reason for Declining</DialogTitle>
                                                    <DialogDescription>This is why {member.user.name} can't make it to the meetup.</DialogDescription>
                                                </DialogHeader>
                                                <div className="p-4 bg-secondary rounded-md text-sm">
                                                    <p className="font-semibold flex items-center gap-2"><MessageSquare /> {member.user.name} says:</p>
                                                    <p className="text-muted-foreground italic">"{member.rejectionReason}"</p>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                     ))}
                                 </div>
                            </div>
                         )}
                    </>
                 )}
            </div>
        )}
      </CardContent>
    </Card>
  );
}
