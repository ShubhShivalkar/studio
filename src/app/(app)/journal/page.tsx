
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JournalChat, useJournalChat } from "@/components/journal-chat";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function JournalPage() {
  const { clearChat, hasStartedConversation } = useJournalChat();

  return (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <CardTitle>My Journal</CardTitle>
                    <CardDescription>Engage in a conversation to explore your thoughts and feelings.</CardDescription>
                </div>
                {hasStartedConversation && (
                     <Button variant="destructive" size="sm" onClick={clearChat}>
                        <Trash2 className="mr-2" />
                        Clear Chat
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <JournalChat />
        </CardContent>
    </Card>
  );
}
