'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { allUsers, currentUser } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function Step1Page() {
  const router = useRouter();
  const { phone, setData } = useOnboardingStore();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists in our mock "database"
    const existingUser = allUsers.find(user => user.phone === phone);

    if (existingUser) {
      // User exists, "log them in" by setting them as the currentUser
      Object.assign(currentUser, existingUser);
      // Ensure journalEntries is initialized
      if (!currentUser.journalEntries) {
          currentUser.journalEntries = [];
      }
      
      toast({
        title: `Welcome back, ${existingUser.name}!`,
        description: "We're redirecting you to your journal.",
      });

      router.push('/journal');
    } else {
      // User does not exist, continue with onboarding
      setData({ phone });
      router.push('/onboarding/step-2');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Welcome! Let's get started.</CardTitle>
        <CardDescription>First, what's your mobile number? If you have an account, this will log you in.</CardDescription>
        <Progress value={20} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="Enter your mobile number" 
              required 
              value={phone}
              onChange={(e) => setData({ phone: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
