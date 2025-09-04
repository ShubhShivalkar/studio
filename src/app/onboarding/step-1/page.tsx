
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { allUsers, currentUser } from '@/lib/mock-data';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/services/user-service';

export default function Step1Page() {
  const router = useRouter();
  const { phone, setData } = useOnboardingStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
      });
      return;
    }
    setIsLoading(true);

    const userPhone = `+91${phone}`;
    const email = `${userPhone}@soulfulsync.app`;
    const password = `password_${userPhone}`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await getUser(userCredential.user.uid);

      if (userProfile) {
        Object.assign(currentUser, userProfile);
        toast({
          title: `Welcome back, ${userProfile.name}!`,
          description: "We're redirecting you to your journal.",
        });
        router.push('/journal');
      } else {
        // This case is unlikely if auth succeeded, but good for robustness
        setData({ phone, countryCode: '91' });
        router.push('/onboarding/step-2');
      }
    } catch (error) {
      // User does not exist, so proceed with onboarding
      setData({ phone, countryCode: '91' });
      router.push('/onboarding/step-2');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome! Let's get started.</CardTitle>
        <CardDescription>
          First, what's your mobile number? Enter the number to continue.
        </CardDescription>
        <Progress value={10} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleContinue}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex items-center gap-2">
               <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                  <span className="text-sm text-muted-foreground">+91</span>
               </div>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="e.g. 2345678900" 
                required 
                value={phone}
                onChange={(e) => setData({ phone: e.target.value.replace(/\D/g, '') })}
                className="flex-1"
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Continuing...' : 'Continue'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
