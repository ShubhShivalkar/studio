
"use client";

import type { GeneratePersonalityPersonaOutput } from "@/ai/flows/generate-personality-persona";
import { generatePersonalityPersona } from "@/ai/flows/generate-personality-persona";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bot, LogOut, Users, BookOpen, Flame, Briefcase, HandHeart, MapPin, Phone, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { differenceInDays, parseISO, format } from 'date-fns';
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import type { User, TribePreferences, DailySummary } from "@/lib/types";
import { TribePreferenceDialog } from "@/components/tribe-preference-dialog";
import { useAuth } from "@/context/auth-context";
import { updateUser } from "@/services/user-service";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getJournalEntries } from "@/services/journal-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProfilePage() {
  const { profile, loading: authLoading } = useAuth();
  const [persona, setPersona] = useState<GeneratePersonalityPersonaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreferenceDialogOpen, setIsPreferenceDialogOpen] = useState(false);
  const [userData, setUserData] = useState<User | null>(profile);
  const [journalEntries, setJournalEntries] = useState<DailySummary[]>([]);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setUserData(profile);
      setIsInterested(profile.interestedInMeetups || false);
      
      // Fetch the journal entries to get the correct count of days
      getJournalEntries(profile.id).then(setJournalEntries);
    }
  }, [profile]);

  const journalEntriesCount = journalEntries.length;
  const progress = Math.min((journalEntriesCount / 15) * 100, 100);
  const canGenerate = journalEntriesCount >= 15;
  const streakDays = journalEntriesCount;
  
  useEffect(() => {
    if (userData && !userData.location && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const city = data.address.city || data.address.town || data.address.village;
          if (city) {
            handleUpdateUser({ location: city });
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      }, (error) => {
          console.error("Geolocation error:", { code: error.code, message: error.message });
          if (error.code === error.PERMISSION_DENIED) {
              toast({
                  variant: "destructive",
                  title: "Location Access Denied",
                  description: "You have denied access to your location. We won't be able to display your city.",
              });
          }
      });
    }
  }, [toast, userData]);

  useEffect(() => {
    if (userData?.persona) {
        setPersona({ persona: userData.persona, hobbies: userData.hobbies || [], interests: userData.interests || [], personalityTraits: [], mbti: userData.mbti || "N/A" });
    }

    if (userData?.personaLastGenerated) {
        const lastGeneratedDate = parseISO(userData.personaLastGenerated);
        const daysSinceLastGeneration = differenceInDays(new Date(), lastGeneratedDate);
        if (daysSinceLastGeneration < 7) {
            setCanRegenerate(false);
        }
    }
  }, [userData]);

  const handleUpdateUser = async (updatedFields: Partial<User>) => {
    if (!userData || !userData.id) return;
    
    try {
      await updateUser(userData.id, updatedFields);
      const updatedUser = { ...userData, ...updatedFields };
      setUserData(updatedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Your profile could not be updated. Please try again.',
      });
    }
  };

  const handleGeneratePersona = async () => {
    if (isLoading || !canRegenerate || !userData) return;

    setIsLoading(true);
    setPersona(null);
    try {
      if (!canGenerate) {
          toast({
              variant: 'destructive',
              title: 'Not enough data',
              description: 'You need at least 15 journal entries to generate a persona.'
          });
          setIsLoading(false);
          return;
      }
      
      const entriesText = journalEntries.map(e => e.summary).join("\n\n");
      const result = await generatePersonalityPersona({ journalEntries: entriesText });
      setPersona(result);
      
      const updatedUserData = {
        persona: result.persona,
        hobbies: result.hobbies,
        interests: result.interests,
        mbti: result.mbti,
        personaLastGenerated: new Date().toISOString()
      };
      
      await handleUpdateUser(updatedUserData);

      setCanRegenerate(false);
    } catch (error) {
      console.error("Failed to generate persona:", error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate persona at this time.'
      })
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestToggle = async (checked: boolean) => {
    setIsInterested(checked);
    await handleUpdateUser({ interestedInMeetups: checked });
    toast({
        title: "Meetup Preference Updated",
        description: `You are now ${checked ? 'discoverable by' : 'hidden from'} potential tribes.`
    });
  }
  
  const handlePreferenceSave = async (preferences: TribePreferences) => {
    await handleUpdateUser({ tribePreferences: preferences });
     toast({
        title: "Tribe Preferences Saved",
        description: `Your preferences have been updated.`
    });
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "There was an issue signing you out. Please try again.",
      });
    }
  };

  const isPersonaValid = persona && persona.persona && !persona.persona.includes("Could not generate") && !persona.persona.includes("unexpected error");

  if (authLoading || !userData) {
    return (
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
                <AvatarImage src={userData.avatar} alt={userData.name} data-ai-hint="person photo" />
                <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{userData.name}</CardTitle>
              <CardDescription>
                  {userData.gender}{userData.dob && `, Born ${format(parseISO(userData.dob), 'MMMM d, yyyy')}`}
                  {userData.location && (
                    <span className="flex items-center justify-center gap-1 mt-1">
                        <MapPin className="h-4 w-4" /> {userData.location}
                    </span>
                  )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {(userData.profession || userData.religion || userData.phone) && (
                  <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
                    {userData.phone && (
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>+91 {userData.phone}</span>
                      </div>
                    )}
                    {userData.profession && (
                      <div className="flex items-center justify-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{userData.profession}</span>
                      </div>
                    )}
                    {userData.religion && (
                      <div className="flex items-center justify-center gap-2">
                        <HandHeart className="h-4 w-4" />
                        <span>{userData.religion}</span>
                      </div>
                    )}
                  </div>
                )}
              <div className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setIsEditDialogOpen(true)}>Edit Profile</Button>
                <Button className="w-full" variant="destructive" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {isPersonaValid && (
            <Card className="bg-accent text-accent-foreground">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <Users /> Tribe Meetups
                      </CardTitle>
                      <CardDescription className="text-accent-foreground/80">
                        Manage your visibility and preferences for tribe meetups.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                          <Label htmlFor="meetup-interest" className="flex-grow pr-4">
                              Interested in meeting new people
                          </Label>
                          <Switch
                              id="meetup-interest"
                              checked={isInterested}
                              onCheckedChange={handleInterestToggle}
                          />
                      </div>
                      {isInterested && (
                          <div className="border-t border-accent-foreground/20 pt-4">
                              <Button className="w-full" variant="outline" onClick={() => setIsPreferenceDialogOpen(true)}>
                                  Set Tribe Preferences
                              </Button>
                          </div>
                      )}
                  </CardContent>
              </Card>
          )}
        </div>
        <div className="md:col-span-1 lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-grow">
                      <CardTitle className="flex items-center gap-2">
                          <Bot className="text-primary"/> Your Persona by Anu
                      </CardTitle>
                      <CardDescription>
                          Based on your journal entries, this is how Anu understands your personality.
                      </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span tabIndex={0}>
                           <Button onClick={handleGeneratePersona} disabled={isLoading || !canGenerate || !canRegenerate} className="w-full sm:w-auto">
                              {isLoading ? "Generating..." : persona ? "Regenerate Persona" : "Generate Persona"}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!canRegenerate && (
                        <TooltipContent>
                          <p>You can regenerate your persona once every 7 days.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="min-h-[12rem]">
              {isLoading ? (
                  <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <div className="flex flex-wrap gap-2 pt-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-16" />
                      </div>
                  </div>
              ) : isPersonaValid ? (
                  <div className="space-y-4">
                      <p className="italic text-foreground/80">{persona.persona}</p>
                      
                      {persona.mbti && (
                        <div>
                            <h3 className="font-semibold mb-2">Personality Type</h3>
                            <Badge variant="secondary">{persona.mbti}</Badge>
                        </div>
                      )}
                      
                      {persona.personalityTraits.length > 0 && (
                          <div>
                              <h3 className="font-semibold mb-2">Personality Traits</h3>
                              <div className="flex flex-wrap gap-2">
                                  {persona.personalityTraits.map((trait, index) => (
                                      <Badge key={index} variant="secondary">{trait}</Badge>
                                  ))}
                              </div>
                          </div>
                      )}
                      
                      {persona.hobbies.length > 0 && (
                          <div>
                              <h3 className="font-semibold mb-2">Hobbies</h3>
                              <div className="flex flex-wrap gap-2">
                                  {persona.hobbies.map((hobby, index) => (
                                      <Badge key={index} variant="secondary">{hobby}</Badge>
                                  ))}
                              </div>
                          </div>
                      )}

                      {persona.interests.length > 0 && (
                          <div>
                              <h3 className="font-semibold mb-2">Interests</h3>
                              <div className="flex flex-wrap gap-2">
                                  {persona.interests.map((interest, index) => (
                                      <Badge key={index} variant="secondary">{interest}</Badge>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center gap-4">
                    <div className="w-full max-w-sm space-y-2">
                        <p className="text-sm">Complete 15 journal entries to generate your persona.</p>
                        <Progress value={progress} />
                        <p className="text-xs">{journalEntriesCount} of 15 entries completed.</p>
                         <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="link" className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-500">
                                    Why do I need this?
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>What is a Persona?</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Your Persona is an AI-generated reflection of you, created by Anu based on your journal entries. It helps us understand your personality, interests, and what makes you unique, so we can connect you with the most compatible people.
                                    </p>
                                    <h3 className="font-semibold">Why 15 entries?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        To create a rich and accurate persona, Anu needs enough information to understand your recurring themes, moods, and interests. Fifteen entries provide a solid foundation for a meaningful analysis.
                                    </p>
                                    <h3 className="font-semibold">Example Persona:</h3>
                                    <div className="p-4 border rounded-lg space-y-3 bg-muted/50 text-sm">
                                        <p className="italic">"A thoughtful and creative individual who finds joy in quiet moments and artistic expression. They have a deep appreciation for nature and enjoy spending their weekends hiking and capturing landscapes through photography."</p>
                                        <div>
                                            <h4 className="font-medium mb-1">Hobbies</h4>
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant="secondary">Photography</Badge>
                                                <Badge variant="secondary">Hiking</Badge>
                                                <Badge variant="secondary">Reading</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {journalEntriesCount > 0 && (
              <Card>
                  <CardHeader>
                      <CardTitle>Journal Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary"/>
                          <div>
                              <p className="font-semibold">{journalEntriesCount}</p>
                              <p className="text-xs text-muted-foreground">Total Entries</p>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-amber-500"/>
                          <div>
                              <p className="font-semibold">{streakDays}</p>
                              <p className="text-xs text-muted-foreground">Day Streak</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          )}
        </div>
      </div>
      <EditProfileDialog 
        user={userData}
        onUpdate={handleUpdateUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <TribePreferenceDialog
        preferences={userData.tribePreferences}
        onSave={handlePreferenceSave}
        open={isPreferenceDialogOpen}
        onOpenChange={setIsPreferenceDialogOpen}
      />
    </>
  );
}
