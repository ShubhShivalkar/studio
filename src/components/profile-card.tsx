
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

interface ProfileCardProps {
  user: User;
  compatibilityScore?: number;
  rsvpStatus?: 'accepted' | 'rejected' | 'pending';
}

const getAge = (dob: string) => differenceInYears(new Date(), parseISO(dob));

export function ProfileCard({ user, compatibilityScore, rsvpStatus }: ProfileCardProps) {
  const getRsvpBadge = () => {
    if (user.id === 'user-0') {
        return <Badge>This is you!</Badge>;
    }
    
    switch (rsvpStatus) {
      case 'accepted':
        return (
          <Badge variant="secondary">
            <CheckCircle className="mr-1.5" />
            Attending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1.5" />
            Not Attending
          </Badge>
        );
      case 'pending':
         return (
          <Badge variant="outline">
            <HelpCircle className="mr-1.5" />
            Pending RSVP
          </Badge>
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
        <CardTitle className="font-headline">{user.name}</CardTitle>
        <CardDescription>
            {user.gender}, {getAge(user.dob)}
        </CardDescription>
        {compatibilityScore && (
            <Badge variant="secondary" className="mt-2">
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
      <CardFooter className="flex justify-center gap-2 pt-4">
        {getRsvpBadge()}
      </CardFooter>
    </Card>
  );
}
