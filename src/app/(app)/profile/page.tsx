
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
import { currentUser } from "@/lib/mock-data";
import { Bot, LogOut, Users, BookOpen, Flame, Briefcase, HandHeart, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { differenceInDays, parseISO, format } from 'date-fns';
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const [persona, setPersona] = useState<GeneratePersonalityPersonaOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(currentUser.interestedInMeetups || false);
  const [canRegenerate, setCanRegenerate] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userData, setUserData] = useState<User>(currentUser);

  const { toast } = useToast();
  const router = useRouter();

  const journalEntriesCount = userData.journalEntries?.length || 0;
  const progress = Math.min((journalEntriesCount / 15) * 100, 100);
  const canGenerate = journalEntriesCount >= 15;
  const streakDays = userData.journalEntries ? Math.min(userData.journalEntries.length, 15) : 0;
  
  useEffect(() => {
    // Fetch location
    if (!userData.location && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using a free reverse geocoding API
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
  }, [toast, userData.location]);

  useEffect(() => {
    if (userData.persona) {
        setPersona({ persona: userData.persona, hobbies: [], interests: [], personalityTraits: [] });
    }

    if (userData.personaLastGenerated) {
        const lastGeneratedDate = parseISO(userData.personaLastGenerated);
        const daysSinceLastGeneration = differenceInDays(new Date(), lastGeneratedDate);
        if (daysSinceLastGeneration < 7) {
            setCanRegenerate(false);
        }
    }
  }, [userData]);

  const handleUpdateUser = (updatedFields: Partial<User>) => {
    const updatedUser = { ...userData, ...updatedFields };
    Object.assign(currentUser, updatedUser); // Update the mock data source
    setUserData(updatedUser);
  };

  const handleGeneratePersona = async () => {
    if (isLoading || !canRegenerate) return;

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
      
      const entriesText = userData.journalEntries!.join("\n\n");
      const result = await generatePersonalityPersona({ journalEntries: entriesText });
      setPersona(result);
      
      const updatedUserData = {
        ...userData,
        persona: result.persona,
        personaLastGenerated: new Date().toISOString()
      };
      Object.assign(currentUser, updatedUserData);
      setUserData(updatedUserData);

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

  const handleInterestToggle = (checked: boolean) => {
    setIsInterested(checked);
    const updatedUserData = { ...userData, interestedInMeetups: checked };
    Object.assign(currentUser, updatedUserData);
    setUserData(updatedUserData);
    toast({
        title: "Meetup Preference Updated",
        description: `You are now ${checked ? 'discoverable by' : 'hidden from'} potential tribes.`
    });
  }

  const handleSignOut = () => {
    router.push('/');
  };

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
            <CardContent className="space-y-4 text-center">
                {(userData.profession || userData.religion) && (
                  <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
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

          <Card className="bg-accent text-accent-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users /> Tribe Meetups
                    </CardTitle>
                    <CardDescription className="text-accent-foreground/80">
                      Manage your visibility for tribe meetups.
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>
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
                  <Button onClick={handleGeneratePersona} disabled={isLoading || !canGenerate || !canRegenerate} className="w-full sm:w-auto">
                      {isLoading ? "Generating..." : persona ? "Regenerate Persona" : "Generate Persona"}
                  </Button>
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
              ) : persona ? (
                  <div className="space-y-4">
                      <p className="italic text-foreground/80">{persona.persona}</p>
                      
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
                      { !canGenerate ? (
                          <>
                              <p className="text-sm">You need at least 15 journal entries to generate a persona.</p>
                              <div className="w-full max-w-sm space-y-2">
                                  <Progress value={progress} />
                                  <p className="text-xs">{journalEntriesCount} of 15 entries completed.</p>
                              </div>
                          </>
                      ) : (
                          <p>Click "Generate Persona" to discover your personality insights.</p>
                      )}
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
    </>
  );
}
