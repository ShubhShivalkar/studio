
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Step3Page() {
  const router = useRouter();
  const { dob, gender, setData } = useOnboardingStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/step-4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">A little more about you</CardTitle>
        <CardDescription>Please provide your date of birth and gender.</CardDescription>
         <Progress value={60} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(new Date(dob), "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dob ? new Date(dob) : undefined}
                  onSelect={(date) => setData({ dob: date ? format(date, 'yyyy-MM-dd') : '' })}
                  captionLayout="dropdown-buttons"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={(value) => setData({ gender: value })}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Male" id="male" />
                <Label htmlFor="male">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Female" id="female" />
                <Label htmlFor="female">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="Prefer not to say" id="prefer-not-to-say" />
                <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
              </div>
            </RadioGroup>
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
