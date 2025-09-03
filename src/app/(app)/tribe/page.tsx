import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TribePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Meet Your Tribe</CardTitle>
        <CardDescription>
          Connect with like-minded people based on your personality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-16">
          <p>Finding the best tribe based on your persona...</p>
        </div>
      </CardContent>
    </Card>
  );
}
