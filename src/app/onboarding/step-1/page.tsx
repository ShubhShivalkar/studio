
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
import { allUsers } from '@/lib/mock-data';

export default function Step1Page() {
  const router = useRouter();
  const { phone, setData } = useOnboardingStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Bypassing OTP. In a real app, you would verify the phone number here.
    // For now, we'll just check if a user with this number exists in our mock data.
    // NOTE: This mock check will be replaced later when we query the real database.
    const existingUser = allUsers.find(user => user.phone === `+91${phone}`);

    setTimeout(() => { // Simulate network delay
      if (existingUser) {
        toast({
          title: `Welcome back, ${existingUser.name}!`,
          description: "We're redirecting you to your journal.",
        });
        // In a real scenario, you'd also set the auth context here
        router.push('/journal');
      } else {
        setData({ phone, countryCode: '91' });
        router.push('/onboarding/step-2');
      }
      setIsLoading(false);
    }, 1000);
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
