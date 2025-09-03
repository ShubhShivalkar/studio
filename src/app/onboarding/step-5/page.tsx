'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { currentUser } from '@/lib/mock-data';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);

  const handleFinish = () => {
    // Save the collected data to the mock current user object
    currentUser.id = `user-${Date.now()}`;
    currentUser.name = onboardingData.name;
    currentUser.dob = onboardingData.dob;
    currentUser.gender = onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    currentUser.avatar = onboardingData.avatar;
    currentUser.journalEntries = [];
    
    // In a real app, you would save this to a backend.
    router.push('/journal');
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="font-headline">You're all set!</CardTitle>
        <CardDescription>You are ready to begin your journey with Soulful Sync.</CardDescription>
        <Progress value={100} className="mt-2" />
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 py-8">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <p>Your profile has been created.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleFinish} className="w-full">
          Start Journaling
        </Button>
      </CardFooter>
    </Card>
  );
}
