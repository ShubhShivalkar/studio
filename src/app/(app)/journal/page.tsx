import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { JournalChat } from "@/components/journal-chat";

export default function JournalPage() {
  return (
    <Card className="h-full w-full flex flex-col">
        <CardHeader>
            <CardTitle>My Journal</CardTitle>
            <CardDescription>Engage in a conversation to explore your thoughts and feelings.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
            <JournalChat />
        </CardContent>
    </Card>
  );
}
