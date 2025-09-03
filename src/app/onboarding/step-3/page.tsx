'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function Step3Page() {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/onboarding/step-4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Set your profile picture</CardTitle>
        <CardDescription>A picture helps others connect with you.</CardDescription>
        <Progress value={75} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32 border-4 border-primary/20">
            <AvatarImage src={avatarPreview || ''} alt="Profile preview" data-ai-hint="person photo" />
            <AvatarFallback className="bg-muted">
              <User className="w-16 h-16 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="w-full">
            <Label htmlFor="picture" className="sr-only">Upload Picture</Label>
            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
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
