
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
import { Bot, LogOut, Users, BookOpen, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { differenceInDays, parseISO } from 'date-fns';

export default function ProfilePage() {
  const [persona, setPersona] = useState<GeneratePersonalityPersonaOutput | null>(
    currentUser.persona ? { persona: currentUser.persona, hobbies: [], interests: [], personalityTraits: [] } : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(currentUser.interestedInMeetups || false);
  const [canRegenerate, setCanRegenerate] = useState(true);

  const { toast } = useToast();
  const router = useRouter();

  const journalEntriesCount = currentUser.journalEntries?.length || 0;
  const progress = Math.min((journalEntriesCount / 15) * 100, 100);
  const canGenerate = journalEntriesCount >= 15;
  const streakDays = 15; // As per mock data assumption

  useEffect(() => {
    if (currentUser.personaLastGenerated) {
        const lastGeneratedDate = parseISO(currentUser.personaLastGenerated);
        const daysSinceLastGeneration = differenceInDays(new Date(), lastGeneratedDate);
        if (daysSinceLastGeneration < 7) {
            setCanRegenerate(false);
        }
    }
  }, []);


  const handleGeneratePersona = async () => {
    if (isLoading) return;
    
    if (!canRegenerate && currentUser.persona) {
        toast({
            variant: 'destructive',
            title: 'Regeneration Limit',
            description: 'You can only regenerate your persona once a week.'
        });
        return;
    }

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
      
      const entriesText = currentUser.journalEntries.join("\n\n");
      const result = await generatePersonalityPersona({ journalEntries: entriesText });
      setPersona(result);
      // Also save to our mock currentUser
      currentUser.persona = result.persona;
      currentUser.personaLastGenerated = new Date().toISOString();
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
    currentUser.interestedInMeetups = checked; // In real app, this would be an API call
    toast({
        title: "Meetup Preference Updated",
        description: `You are now ${checked ? 'discoverable by' : 'hidden from'} potential tribes.`
    });
  }

  const handleSignOut = () => {
    router.push('/');
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader className="items-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person photo" />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline">{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.gender}, Born {currentUser.dob}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">Edit Profile</Button>
            <Button className="w-full" variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
          </CardContent>
        </Card>

        {persona && (
           <Card className="bg-accent text-accent-foreground">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
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
        )}
      </div>
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="text-primary"/> Your Persona by Anu
                    </CardTitle>
                    <CardDescription>
                        Based on your journal entries, this is how Anu understands your personality.
                    </CardDescription>
                </div>
                <Button onClick={handleGeneratePersona} disabled={isLoading || !canGenerate}>
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
                    { !canGenerate && (
                        <>
                            <p className="text-sm">You need at least 15 journal entries to generate a persona.</p>
                            <div className="w-full max-w-sm space-y-2">
                                <Progress value={progress} />
                                <p className="text-xs">{journalEntriesCount} of 15 entries completed.</p>
                            </div>
                        </>
                    )}
                </div>
            )}
          </CardContent>
        </Card>

        {canGenerate && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Journal Stats</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-8">
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
  );
}
