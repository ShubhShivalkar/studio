
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import type { User } from '@/lib/types';
import { createUser } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';
import { allUsers } from '@/lib/mock-data';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);
  const { toast } = useToast();

  const handleFinish = async () => {
    // Generate a unique ID for the new user.
    // In a real scenario, this would come from Firebase Auth after verification.
    const userId = `user-${Date.now()}`;
    const userPhone = `+${onboardingData.countryCode}${onboardingData.phone}`;

    // Create the new user object from the data collected during onboarding
    const newUser: User = {
        id: userId,
        name: onboardingData.name,
        dob: onboardingData.dob,
        gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
        avatar: onboardingData.avatar,
        phone: userPhone,
        journalEntries: [],
    };
    
    try {
        // Save the new user to the database
        await createUser(userId, newUser);
        
        // Also add to mock data for immediate use in the app session
        allUsers.push(newUser);

        toast({
            title: "Profile Created!",
            description: "Welcome! Your journey begins now.",
        });
        
        // Redirect to the main app
        router.push('/journal');
    } catch (error) {
        console.error("Failed to create user profile:", error);
        toast({
            variant: "destructive",
            title: "Profile Creation Failed",
            description: "We couldn't save your profile. Please try again.",
        });
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
        <Button className="w-full" onClick={handleFinish}>
          Start Journaling
        </Button>
      </CardFooter>
    </Card>
  );
}
