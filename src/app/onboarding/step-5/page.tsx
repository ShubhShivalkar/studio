
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, AuthErrorCodes } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';

export default function Step5Page() {
  const router = useRouter();
  const onboardingData = useOnboardingStore((state) => state);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    setIsLoading(true);
    // For testing, we generate a fake email from the phone number to use Firebase Auth
    const userPhone = `+${onboardingData.countryCode}${onboardingData.phone}`;
    const email = `${userPhone}@soulfulsync.app`;
    const password = `password_${userPhone}`; // Simple password for testing

    try {
        let userCredential;
        try {
            // Try to sign in first, in case the user was already created during a previous attempt
             userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
             if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                // If user not found, create a new one.
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
             } else {
                // For other errors, re-throw to be caught by the outer catch block.
                throw error;
             }
        }

        const userId = userCredential.user.uid;

        const newUser: User = {
            id: userId,
            name: onboardingData.name,
            dob: onboardingData.dob,
            gender: onboardingData.gender as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
            avatar: onboardingData.avatar,
            phone: userPhone,
            journalEntries: [],
        };
        
        // Save the new user to the database
        await saveUser(userId, newUser);
        
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
        
        let description = "We couldn't save your profile. Please try again.";
        if (error.code === 'auth/operation-not-allowed') {
            description = "Email/Password sign-in is not enabled in your Firebase project. Please enable it in the Firebase Console under Authentication > Sign-in method.";
        }

        toast({
            variant: "destructive",
            title: "Profile Creation Failed",
            description: description,
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
