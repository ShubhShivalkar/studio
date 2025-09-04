'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';

export default function Step2Page() {
  const router = useRouter();
  const { name, setData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/step-3');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Great, what's your name?</CardTitle>
        <CardDescription>This will be displayed on your profile.</CardDescription>
        <Progress value={40} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Enter your full name" 
              required 
              value={name}
              onChange={(e) => setData({ name: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="gap-2">
           <Button variant="outline" className="w-full" onClick={() => router.back()}>Back</Button>
          <Button type="submit" className="w-full">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
