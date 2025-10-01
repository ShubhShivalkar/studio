
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { getAllUsers } from "@/services/user-service";
import { UserProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/services/group-service";

export default function CreateGroupPage() {
    const { user, profile, loading } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState("");

    useEffect(() => {
        if (!loading && !profile?.is_admin) {
            router.push('/');
        }
    }, [loading, profile, router]);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setAllUsers(users);
        };
        fetchUsers();
    }, []);

    const handleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateGroup = async () => {
        if (selectedUsers.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Please select at least one user." });
            return;
        }
        if (!groupName) {
            toast({ variant: "destructive", title: "Error", description: "Group name is required." });
            return;
        }

        setIsLoading(true);
        try {
            await createGroup(groupName, selectedUsers);
            toast({ title: "Success", description: "Group created successfully." });
            router.push('/dev');
        } catch (error) {
            console.error("Failed to create group:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create group." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create Group</CardTitle>
                    <CardDescription>Select users to form a new group.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Input
                            placeholder="Group Name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="mb-4"
                        />
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Select</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox
                                                    id={`select-${user.id}`}
                                                    onCheckedChange={() => handleUserSelection(user.id)}
                                                    checked={selectedUsers.includes(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button onClick={handleCreateGroup} disabled={isLoading}>
                            {isLoading ? "Creating Group..." : "Create Group"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
