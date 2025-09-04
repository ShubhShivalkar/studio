
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const days = Array.from({ length: 31 }, (_, i) => i + 1);


export default function Step3Page() {
  const router = useRouter();
  const { dob, gender, setData } = useOnboardingStore();
  
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    if (dob) {
      const [y, m, d] = dob.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [dob]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (day && month && year) {
        setData({ dob: `${year}-${month}-${day}`});
        router.push('/onboarding/step-4');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>A little more about you</CardTitle>
        <CardDescription>Please provide your date of birth and gender.</CardDescription>
         <Progress value={60} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <div className="flex gap-2">
                <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger aria-label="Month">
                        <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={day} onValueChange={setDay}>
                    <SelectTrigger aria-label="Day">
                        <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                         {days.map(d => <SelectItem key={d} value={String(d).padStart(2, '0')}>{d}</SelectItem>)}
                    </SelectContent>
                </Select>
                 <Select value={year} onValueChange={setYear}>
                    <SelectTrigger aria-label="Year">
                        <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
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
          <Button type="submit" className="w-full" disabled={!day || !month || !year}>Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
