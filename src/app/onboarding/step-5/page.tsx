
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import type { User } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { createUser } from '@/services/user-service';
import { useToast } from '@/hooks/use-toast';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const handleFinish = async () => {
    if (!authUser) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create a profile.",
        });
        router.push('/onboarding/step-1');
        return;
    }
    
    // Create the new user object
    const newUser: Omit<User, 'id'> = {
        name: onboardingData.name,
        dob: onboardingData.dob,
        gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
        avatar: onboardingData.avatar,
        phone: authUser.phoneNumber || onboardingData.phone, // Prefer phone from auth
        journalEntries: [],
    };
    
    try {
        await createUser(authUser.uid, newUser);
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
