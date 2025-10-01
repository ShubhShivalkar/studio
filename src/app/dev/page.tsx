
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { addSampleEntries, deleteAllUserData, seedSampleUsers, getSystemStatus, updateWaitlistStatus } from "@/services/dev-service";
import { deleteSampleUsers } from "@/services/user-service";
import { AlertTriangle, PlusCircle, Server, Power, Users, Layout } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function DevPage() {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingUsers, setIsDeletingUsers] = useState(false);
    const [isSeedingUsers, setIsSeedingUsers] = useState(false);
    const [isDeletingAllData, setIsDeletingAllData] = useState(false);
    const [isWaitlistActive, setIsWaitlistActive] = useState(false);
    const [isUpdatingWaitlist, setIsUpdatingWaitlist] = useState(false);

    useEffect(() => {
        if (!loading && !profile?.is_admin) {
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }
    }, [loading, profile, router]);

    useEffect(() => {
        const fetchStatus = async () => {
            const status = await getSystemStatus();
            if (status) {
                setIsWaitlistActive(status.isWaitlistActive);
            }
        };
        fetchStatus();
    }, []);

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

    const handleSeedUsers = async () => {
        setIsSeedingUsers(true);
        try {
            await seedSampleUsers();
            toast({ title: "Success", description: "100 sample users have been created." });
        } catch (error) {
             console.error("Failed to seed sample users:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create sample users." });
        } finally {
            setIsSeedingUsers(false);
        }
    }

    const handleWaitlistToggle = async (isChecked: boolean) => {
        setIsUpdatingWaitlist(true);
        try {
            await updateWaitlistStatus(isChecked);
            setIsWaitlistActive(isChecked);
            toast({ title: "Success", description: `Waitlist has been ${isChecked ? 'activated' : 'deactivated'}.` });
        } catch (error) {
            console.error("Failed to update waitlist status:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update waitlist status." });
        } finally {
            setIsUpdatingWaitlist(false);
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-10 text-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!profile?.is_admin) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-3xl font-bold text-destructive">Not Authorized</h1>
                <p className="text-muted-foreground">
                    You do not have permission to access this page. You will be redirected to the homepage shortly.
                </p>
            </div>
        );
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="md:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server /> My Test Account
                            </CardTitle>
                             <CardDescription>
                                Use these tools to manage your own test user data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button onClick={handleAddData} disabled={isLoading || !user} className="w-full">
                                {isLoading ? "Adding Data..." : "Add Sample Data"}
                            </Button>
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
                </div>
                <div className="md:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users /> Global Data Management
                            </CardTitle>
                             <CardDescription>
                                Use these tools to manage all user data in the database.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isSeedingUsers} className="w-full">
                                        {isSeedingUsers ? "Creating Users..." : "Seed 100 Sample Users"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will create 100 new user documents in the database, which will require cleanup later.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSeedUsers}>
                                            Yes, create them
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PlusCircle /> Tribe Management
                            </CardTitle>
                            <CardDescription>
                                Manually create a new tribe with selected users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dev/create-tribe">Create Tribe</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layout /> Group Management
                            </CardTitle>
                            <CardDescription>
                                Manually create a new group with selected users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="w-full">
                                <Link href="/dev/create-group">Create Group</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Power /> System Status
                            </CardTitle>
                            <CardDescription>
                                Control system-wide settings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <Label htmlFor="waitlist-toggle" className="flex items-center gap-2">
                                Waitlist Status
                                <span className={`text-sm ${isWaitlistActive ? 'text-green-500' : 'text-red-500'}`}>
                                    ({isWaitlistActive ? "Active" : "Inactive"})
                                </span>
                            </Label>
                            <Switch
                                id="waitlist-toggle"
                                checked={isWaitlistActive}
                                onCheckedChange={handleWaitlistToggle}
                                disabled={isUpdatingWaitlist}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
