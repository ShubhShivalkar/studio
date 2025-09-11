
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers } from "@/services/user-service";
import { createTribe } from "@/services/tribe-service";
import type { User, MatchedUser } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CreateTribePage() {
    const { toast } = useToast();
    const router = useRouter();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [meetupDate, setMeetupDate] = useState("");
    const [meetupTime, setMeetupTime] = useState("");
    const [location, setLocation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setAllUsers(users);
            const eligible = users.filter(user => 
                user.persona && 
                user.interestedInMeetups && 
                !user.currentTribeId
            );
            setEligibleUsers(eligible);
        };
        fetchUsers();
    }, []);

    const calculateAge = (dob: string): number => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreateTribe = async () => {
        if (selectedUsers.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Please select at least one user." });
            return;
        }
        if (!meetupDate || !location) {
            toast({ variant: "destructive", title: "Error", description: "Meetup date and location are required." });
            return;
        }

        setIsLoading(true);
        try {
            const memberUsers = allUsers.filter(u => selectedUsers.includes(u.id));
            const matchedUsers: MatchedUser[] = memberUsers.map(user => ({
                userId: user.id,
                user,
                compatibilityScore: 100, // Default score for manual creation
                persona: user.persona || "N/A",
                matchReason: "Manually created tribe",
                rsvpStatus: "pending",
            }));

            await createTribe({
                members: matchedUsers,
                meetupDate,
                meetupTime,
                location,
                is_active: true,
            });

            toast({ title: "Success", description: "Tribe created successfully." });
            router.push("/dev");
        } catch (error) {
            console.error("Failed to create tribe:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not create tribe." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 flex space-x-8">
            <div className="w-2/3">
                <Card>
                    <CardHeader>
                        <CardTitle>Eligible Users for Tribe Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg overflow-auto max-h-[70vh]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">Select</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Hobbies</TableHead>
                                        <TableHead>Persona</TableHead>
                                        <TableHead>MBTI</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Age</TableHead>
                                        <TableHead>Gender</TableHead>
                                        <TableHead>Tribe Pref.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {eligibleUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <Checkbox
                                                    id={`select-${user.id}`}
                                                    onCheckedChange={() => handleUserSelection(user.id)}
                                                    checked={selectedUsers.includes(user.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.hobbies?.slice(0, 2).join(', ')}</TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={user.persona}>{user.persona}</TableCell>
                                            <TableCell>{user.mbti}</TableCell>
                                            <TableCell>{user.location}</TableCell>
                                            <TableCell>{calculateAge(user.dob)}</TableCell>
                                            <TableCell>{user.gender}</TableCell>
                                            <TableCell>{`${user.tribePreferences?.gender}, ${user.tribePreferences?.ageRange.join('-')}`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="w-1/3">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Tribe</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Selected Users</Label>
                            <div className="flex flex-wrap gap-2">
                                {selectedUsers.map(userId => {
                                    const user = allUsers.find(u => u.id === userId);
                                    return user ? <Badge key={userId} variant="secondary">{user.name}</Badge> : null;
                                })}
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="meetupDate">Meetup Date</Label>
                                <Input id="meetupDate" type="date" value={meetupDate} onChange={e => setMeetupDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="meetupTime">Time (Optional)</Label>
                                <Input id="meetupTime" type="time" value={meetupTime} onChange={e => setMeetupTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Central Park Cafe" />
                        </div>
                        <Button onClick={handleCreateTribe} disabled={isLoading || selectedUsers.length === 0} className="w-full">
                            {isLoading ? "Creating Tribe..." : "Create Tribe"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
