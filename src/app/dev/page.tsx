
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { addSampleEntries, deleteSampleEntries } from "@/services/dev-service";
import { AlertTriangle, DatabaseZap, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DevPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleAddData = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to add data." });
            return;
        }
        setIsLoading(true);
        try {
            await addSampleEntries(user.uid);
            toast({ title: "Success", description: "Sample data has been added to your profile." });
        } catch (error) {
            console.error("Failed to add sample data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add sample data." });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveData = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to remove data." });
            return;
        }
        setIsLoading(true);
        try {
            await deleteSampleEntries(user.uid);
            toast({ variant: "destructive", title: "Success", description: "All sample data has been removed." });
        } catch (error) {
            console.error("Failed to remove sample data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not remove sample data." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Developer Tools</h1>
                <p className="text-muted-foreground">Manage sample data for testing and development.</p>
            </div>

             <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    These tools are for development purposes only and will perform destructive operations on the database.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DatabaseZap /> Add Sample Data
                        </CardTitle>
                        <CardDescription>
                            Populate the current user's account with sample journal entries, reminders, and checklists. This is useful for testing the calendar, persona generation, and other features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleAddData} disabled={isLoading || !user} className="w-full">
                            {isLoading ? "Adding Data..." : "Add Sample Data"}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 /> Remove Sample Data
                        </CardTitle>
                        <CardDescription>
                            Delete all sample data associated with the current user. This will remove any entries created by the "Add Sample Data" tool.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Button onClick={handleRemoveData} disabled={isLoading || !user} variant="destructive" className="w-full">
                            {isLoading ? "Removing Data..." : "Remove Sample Data"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
