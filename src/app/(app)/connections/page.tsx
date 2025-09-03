import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { connections, otherUsers, requests } from "@/lib/mock-data";

export default function ConnectionsPage() {
  const myConnections = connections
    .filter((c) => c.status === 'accepted')
    .map((c) => otherUsers.find((u) => u.id === c.userId))
    .filter(Boolean);

  const pendingRequests = requests
    .map((r) => otherUsers.find((u) => u.id === r.userId))
    .filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Connections</CardTitle>
        <CardDescription>Manage your connections and view pending requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="connections">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>
          <TabsContent value="connections">
            <div className="space-y-4 pt-4">
              {myConnections.length > 0 ? (
                myConnections.map((user) => user && (
                  <div key={user.id} className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person photo" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground italic">
                        "{user.persona?.substring(0, 50)}..."
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Message
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground pt-8">
                  You haven't made any connections yet.
                </p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="requests">
            <div className="space-y-4 pt-4">
                {pendingRequests.length > 0 ? (
                    pendingRequests.map((user) => user && (
                        <div key={user.id} className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="person photo" />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">Wants to connect with you.</p>
                            </div>
                            <div className="ml-auto flex gap-2">
                                <Button size="sm">Accept</Button>
                                <Button variant="outline" size="sm">Decline</Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground pt-8">
                        You have no new connection requests.
                    </p>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
