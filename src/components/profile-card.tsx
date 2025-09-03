
"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { Ban, Heart } from "lucide-react";

interface ProfileCardProps {
  user: User;
  compatibilityScore?: number;
  matchReason?: string;
}

export function ProfileCard({ user, compatibilityScore, matchReason }: ProfileCardProps) {
  const { toast } = useToast();

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    toast({
      title: "Connection Request Sent",
      description: `Your request to connect with ${user.name} has been sent.`,
    });
  };

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    toast({
        variant: "destructive",
        title: "User Blocked",
        description: `${user.name} has been blocked and will no longer appear in your discover feed.`,
    });
  }

  return (
    <Card className="flex flex-col h-full hover:bg-muted/50 transition-colors">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/20">
          <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person photo" />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline">{user.name}</CardTitle>
        {compatibilityScore && (
            <CardDescription className="font-bold text-primary">
                {compatibilityScore}% Match
            </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground text-center italic line-clamp-3">
          "{user.persona || 'Persona not yet generated.'}"
        </p>
      </CardContent>
      <CardFooter className="flex justify-center gap-2 pt-4">
        {user.id !== 'user-0' && ( // Don't show buttons for the current user
            <>
                <Button variant="outline" size="icon" onClick={handleBlock}>
                    <Ban className="h-4 w-4" />
                    <span className="sr-only">Block</span>
                </Button>
                <Button onClick={handleConnect}>
                    <Heart className="mr-2 h-4 w-4" /> Connect
                </Button>
            </>
        )}
      </CardFooter>
    </Card>
  );
}
