"use client";

import { generatePersonalityPersona } from "@/ai/flows/generate-personality-persona";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/lib/mock-data";
import { Bot } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [persona, setPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePersona = async () => {
    setIsLoading(true);
    try {
      const journalEntries = currentUser.journalEntries?.join("\n\n") || "";
      if (!journalEntries) {
          toast({
              variant: 'destructive',
              title: 'Not enough data',
              description: 'Please write a few journal entries first to generate a persona.'
          });
          setIsLoading(false);
          return;
      }
      const result = await generatePersonalityPersona({ journalEntries });
      setPersona(result.persona);
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

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader className="items-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} data-ai-hint="person photo" />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="font-headline">{currentUser.name}</CardTitle>
            <CardDescription>{currentUser.gender}, Born {currentUser.dob}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Bot className="text-primary"/> Your AI-Generated Persona
                    </CardTitle>
                    <CardDescription>
                        Based on your journal entries, this is how our AI understands your personality.
                    </CardDescription>
                </div>
                <Button onClick={handleGeneratePersona} disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Persona"}
                </Button>
            </div>
          </CardHeader>
          <CardContent className="min-h-[12rem]">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ) : persona ? (
                <p className="italic text-foreground/80">{persona}</p>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>Your persona will appear here once generated.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
