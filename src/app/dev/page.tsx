
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { addSampleEntries, deleteAllUserData } from "@/services/dev-service";
import { deleteSampleUsers } from "@/services/user-service";
import { AlertTriangle, DatabaseZap, Trash2, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function DevPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingUsers, setIsDeletingUsers] = useState(false);
    const [isDeletingAllData, setIsDeletingAllData] = useState(false);

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

    const handleDeleteAllUserData = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to delete your data." });
            return;
        }
        setIsDeletingAllData(true);
        try {
            await deleteAllUserData(user.uid);
            toast({ variant: "destructive", title: "Success", description: "All your data has been deleted and your profile has been reset." });
        } catch (error) {
            console.error("Failed to delete user data:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete your data." });
        } finally {
            setIsDeletingAllData(false);
        }
    };
    
    const handleDeleteAllSampleUsers = async () => {
        setIsDeletingUsers(true);
        try {
            await deleteSampleUsers();
            toast({ variant: "destructive", title: "Success", description: "All sample user profiles have been deleted." });
        } catch (error) {
             console.error("Failed to delete sample users:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete sample users." });
        } finally {
            setIsDeletingUsers(false);
        }
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Developer Tools</h1>
                <p className="text-muted-foreground">Manage sample data for testing and development.</p>
            </div>

             <Alert variant="destructive" className="max-w-4xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    These tools are for development purposes only and will perform destructive operations on the database. Use with caution.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DatabaseZap /> Add Sample Data
                        </CardTitle>
                        <CardDescription>
                            Populate your account with 15 sample journal entries, reminders, and checklists for testing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleAddData} disabled={isLoading || !user} className="w-full">
                            {isLoading ? "Adding Data..." : "Add Sample Data to My Account"}
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trash2 /> Delete All My Data
                        </CardTitle>
                        <CardDescription>
                           Delete all your journal entries, reminders, and checklists. This will also reset your generated persona.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isDeletingAllData || !user} variant="destructive" className="w-full">
                                    {isDeletingAllData ? "Deleting Data..." : "Delete All My Data"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all data associated with your account, including your persona.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllUserData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Yes, delete my data
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users /> Delete All Sample Users
                        </CardTitle>
                        <CardDescription>
                            Permanently delete all user profiles from the database that were created as sample data. This cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={isDeletingUsers} variant="destructive" className="w-full">
                                    {isDeletingUsers ? "Deleting Users..." : "Delete Sample Users"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete all sample user profiles from the database.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAllSampleUsers} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Yes, delete them
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
