'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function Step1Page() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/step-2');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Welcome! Let's get started.</CardTitle>
        <CardDescription>First, what's your mobile number?</CardDescription>
        <Progress value={20} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input id="phone" type="tel" placeholder="Enter your mobile number" required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
