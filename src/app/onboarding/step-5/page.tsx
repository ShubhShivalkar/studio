
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { currentUser, allUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);

  const handleFinish = (isInterested: boolean) => {
    // Create the new user object
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: onboardingData.name,
        dob: onboardingData.dob,
        gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
        avatar: onboardingData.avatar,
        phone: onboardingData.phone,
        journalEntries: [],
        interestedInMeetups: isInterested,
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
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">
                    Start Journaling
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                       <Users className="h-6 w-6 text-primary" /> One last thing...
                    </DialogTitle>
                    <DialogDescription>
                       Anuvaad is about connecting with people who share your vibe. Are you interested in meeting new people through our Tribe meetups?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-center">
                    <Button onClick={() => handleFinish(false)} variant="outline">Maybe Later</Button>
                    <Button onClick={() => handleFinish(true)}>Yes, I'm interested!</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
