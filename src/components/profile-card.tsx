
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { differenceInYears, parseISO } from 'date-fns';

interface ProfileCardProps {
  user: User;
  rsvpStatus?: 'accepted' | 'rejected' | 'pending';
  isJoinedExternally?: boolean;
}

const getAge = (dob: string | undefined) => {
  if (!dob) return '';
  return differenceInYears(new Date(), parseISO(dob));
};

const formatName = (name: string): string => {
  if (!name) return "";
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
  }
  return name;
};

export function ProfileCard({ user, rsvpStatus }: ProfileCardProps) {
  return (
    <div className={cn(
        "flex items-center py-4 px-4 w-full cursor-pointer hover:bg-muted/50 transition-colors",
        rsvpStatus === 'rejected' && "opacity-50"
    )}>
        <Avatar className="w-12 h-12 mr-4">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
            <h3 className="font-semibold">{formatName(user.name)}</h3>
            <p className="text-sm text-muted-foreground">
                {user.gender}{user.dob && `, ${getAge(user.dob)}`}
            </p>
        </div>
        <div className="ml-auto pl-4">
            {rsvpStatus && (
              <Badge
                variant={
                  rsvpStatus === 'accepted' ? 'default' :
                  rsvpStatus === 'rejected' ? 'destructive' : 'secondary'
                }
                className={cn(rsvpStatus === 'accepted' && 'bg-green-600')}
              >
                {rsvpStatus.charAt(0).toUpperCase() + rsvpStatus.slice(1)}
              </Badge>
            )}
        </div>
    </div>
  );
}
