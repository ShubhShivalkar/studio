
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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

    // Filter states
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [mbtiFilter, setMbtiFilter] = useState<string[]>([]);
    const [minAgeFilter, setMinAgeFilter] = useState('');
    const [maxAgeFilter, setMaxAgeFilter] = useState('');
    const [hobbiesFilter, setHobbiesFilter] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState<string[]>([]);

    // Unique options for filters
    const [genders, setGenders] = useState<string[]>([]);
    const [mbtiTypes, setMbtiTypes] = useState<string[]>([]);
    const [allHobbies, setAllHobbies] = useState<string[]>([]);
    const [allLocations, setAllLocations] = useState<string[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            setAllUsers(users);
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (allUsers.length > 0) {
            const uniqueGenders = [...new Set(allUsers.map(user => user.gender).filter(Boolean))] as string[];
            const uniqueMbti = [...new Set(allUsers.map(user => user.mbti).filter(Boolean))] as string[];
            const uniqueHobbies = [...new Set(allUsers.flatMap(user => user.hobbies || []).filter(Boolean))].sort();
            const uniqueLocations = [...new Set(allUsers.map(user => user.location).filter(Boolean))] as string[];
            setGenders(uniqueGenders);
            setMbtiTypes(uniqueMbti);
            setAllHobbies(uniqueHobbies);
            setAllLocations(uniqueLocations);
        }
    }, [allUsers]);

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

    useEffect(() => {
        let filtered = allUsers.filter(user =>
            user.persona &&
            user.interestedInMeetups &&
            !user.currentTribeId
        );

        if (genderFilter.length > 0) {
            filtered = filtered.filter(user => user.gender && genderFilter.includes(user.gender));
        }

        if (mbtiFilter.length > 0) {
            filtered = filtered.filter(user => user.mbti && mbtiFilter.includes(user.mbti));
        }

        if (minAgeFilter) {
            filtered = filtered.filter(user => calculateAge(user.dob) >= parseInt(minAgeFilter, 10));
        }

        if (maxAgeFilter) {
            filtered = filtered.filter(user => calculateAge(user.dob) <= parseInt(maxAgeFilter, 10));
        }

        if (hobbiesFilter.length > 0) {
            filtered = filtered.filter(user => user.hobbies && user.hobbies.some(hobby => hobbiesFilter.includes(hobby)));
        }

        if (locationFilter.length > 0) {
            filtered = filtered.filter(user => user.location && locationFilter.includes(user.location));
        }

        setEligibleUsers(filtered);
    }, [allUsers, genderFilter, mbtiFilter, minAgeFilter, maxAgeFilter, hobbiesFilter, locationFilter]);


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

    const toggleFilter = (filter: string[], setFilter: (value: string[]) => void, value: string) => {
        setFilter(filter.includes(value) ? filter.filter(v => v !== value) : [...filter, value]);
    };
    
    return (
        <div className="container mx-auto py-10 flex space-x-8">
            <div className="w-2/3">
                <Card>
                    <CardHeader>
                        <CardTitle>Eligible Users for Tribe Creation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4 mb-6 p-4 border rounded-lg">
                            {/* Gender Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Gender {genderFilter.length > 0 && `(${genderFilter.length})`}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Filter by Gender</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {genders.map(gender => (
                                        <DropdownMenuCheckboxItem key={gender} checked={genderFilter.includes(gender)} onCheckedChange={() => toggleFilter(genderFilter, setGenderFilter, gender)}>
                                            {gender}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* MBTI Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">MBTI {mbtiFilter.length > 0 && `(${mbtiFilter.length})`}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Filter by MBTI</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {mbtiTypes.map(type => (
                                        <DropdownMenuCheckboxItem key={type} checked={mbtiFilter.includes(type)} onCheckedChange={() => toggleFilter(mbtiFilter, setMbtiFilter, type)}>
                                            {type}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                             {/* Hobbies Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Hobbies {hobbiesFilter.length > 0 && `(${hobbiesFilter.length})`}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-h-80 overflow-y-auto">
                                    <DropdownMenuLabel>Filter by Hobbies</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {allHobbies.map(hobby => (
                                        <DropdownMenuCheckboxItem key={hobby} checked={hobbiesFilter.includes(hobby)} onCheckedChange={() => toggleFilter(hobbiesFilter, setHobbiesFilter, hobby)}>
                                            {hobby}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Location Filter */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Location {locationFilter.length > 0 && `(${locationFilter.length})`}</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="max-h-80 overflow-y-auto">
                                    <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {allLocations.map(location => (
                                        <DropdownMenuCheckboxItem key={location} checked={locationFilter.includes(location)} onCheckedChange={() => toggleFilter(locationFilter, setLocationFilter, location)}>
                                            {location}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Age Range Filter */}
                           <div className="flex items-center space-x-2">
                               <Label>Age:</Label>
                                <Input className="w-20" id="min-age-filter" type="number" placeholder="Min" value={minAgeFilter} onChange={e => setMinAgeFilter(e.target.value)} />
                                <Input className="w-20" id="max-age-filter" type="number" placeholder="Max" value={maxAgeFilter} onChange={e => setMaxAgeFilter(e.target.value)} />
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-auto max-h-[60vh]">
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
