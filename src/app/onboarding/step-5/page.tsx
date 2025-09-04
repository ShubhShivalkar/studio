
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { currentUser, allUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);

  const handleFinish = () => {
    // Create the new user object
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: onboardingData.name,
        dob: onboardingData.dob,
        gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
        avatar: onboardingData.avatar,
        phone: onboardingData.phone,
        journalEntries: [],
    };
    
    // Add the new user to our mock "database"
    allUsers.push(newUser);
    // Set the new user as the currently logged-in user
    Object.assign(currentUser, newUser);
    
    // In a real app, you would save this to a backend.
    router.push('/journal');
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
