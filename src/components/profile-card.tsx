
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { User } from "@/lib/types";
import { Badge } from "./ui/badge";
import { differenceInYears, parseISO, format } from 'date-fns';
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface ProfileCardProps {
  user: User;
  compatibilityScore?: number;
  rsvpStatus?: 'accepted' | 'rejected' | 'pending';
}

const getAge = (dob: string) => differenceInYears(new Date(), parseISO(dob));

export function ProfileCard({ user, compatibilityScore, rsvpStatus }: ProfileCardProps) {
  const getRsvpBadge = () => {
    if (user.id === 'user-0') {
        return <Button variant="secondary" size="sm" className="w-full">This is you!</Button>;
    }
    
    switch (rsvpStatus) {
      case 'accepted':
      case 'pending':
        return (
          <Button variant="secondary" size="sm" className="w-full">
            <CheckCircle className="mr-1.5" />
            Attending
          </Button>
        );
      case 'rejected':
        return (
          <Button variant="destructive" size="sm" className="w-full">
            <XCircle className="mr-1.5" />
            Not Attending
          </Button>
        );
      default:
        return null;
    }
  };


  return (
    <Card className={cn("flex flex-col h-full hover:bg-muted/50 transition-colors", rsvpStatus === 'rejected' && "opacity-60")}>
      <CardHeader className="items-center text-center pb-2">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person photo" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>
            {user.gender}, {getAge(user.dob)}
        </CardDescription>
        {compatibilityScore && (
            <Badge variant="outline" className="mt-2 text-primary border-primary/50 bg-primary/10">
                {compatibilityScore}% Match
            </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-1 text-center space-y-3 pt-2">
         {user.hobbies && user.hobbies.length > 0 && (
            <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">Hobbies</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                    {user.hobbies.slice(0, 3).map((hobby, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{hobby}</Badge>
                    ))}
                </div>
            </div>
        )}
        {user.interests && user.interests.length > 0 && (
            <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">Interests</h4>
                <div className="flex flex-wrap gap-1 justify-center">
                    {user.interests.slice(0, 2).map((interest, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{interest}</Badge>
                    ))}
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-4 px-4">
        {getRsvpBadge()}
      </CardFooter>
    </Card>
  );
}

    
