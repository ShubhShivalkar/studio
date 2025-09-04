
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import type { User } from '@/lib/types';
import { createUser as saveUser } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { allUsers, currentUser } from '@/lib/mock-data';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);
    
    const user = auth.currentUser;
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You are not logged in. Please start the onboarding process again.",
        });
        setIsLoading(false);
        router.push('/onboarding/step-1');
        return;
    }

    try {
        const newUser: User = {
            id: user.uid,
            name: onboardingData.name,
            dob: onboardingData.dob,
            gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
            avatar: onboardingData.avatar,
            email: user.email,
            journalEntries: [],
            interestedInMeetups: false,
        };
        
        // Save the new user to the database
        await saveUser(user.uid, newUser);
        
        // Add to mock data for immediate use in the app session
        allUsers.push(newUser);

        // Update the global currentUser object for the current session
        Object.assign(currentUser, newUser);

        toast({
            title: "Profile Created!",
            description: "Welcome! Your journey begins now.",
        });
        
        // Redirect to the main app
        router.push('/journal');
    } catch (error: any) {
        console.error("Failed to create user profile:", error);
        
        toast({
            variant: "destructive",
            title: "Profile Creation Failed",
            description: "We couldn't save your profile. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>You're all set!</CardTitle>
        <CardDescription>You are ready to begin your journey with anuvaad.</CardDescription>
        <Progress value={100} className="mt-2" />
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 py-8">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <p>Your profile has been created.</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleFinish} disabled={isLoading}>
          {isLoading ? 'Finishing...' : 'Start Journaling'}
        </Button>
      </CardFooter>
    </Card>
  );
}
