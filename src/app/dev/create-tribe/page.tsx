"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers } from "@/services/user-service";
import { createTribe, getAllTribes, updateTribe, deleteTribe, updateAllTribesStatus, deleteInactiveAndArchiveActiveTribes } from "@/services/tribe-service";
import type { User, MatchedUser, Tribe } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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
    const [allTribes, setAllTribes] = useState<Tribe[]>([]);
    const [compatibilityScore, setCompatibilityScore] = useState(0);

    // Filter states
    const [genderFilter, setGenderFilter] = useState<string[]>([]);
    const [mbtiFilter, setMbtiFilter] = useState<string[]>([]);
    const [minAgeFilter, setMinAgeFilter] = useState('');
    const [maxAgeFilter, setMaxAgeFilter] = useState('');
    const [hobbiesFilter, setHobbiesFilter] = useState<string[]>([]);
    const [locationFilter, setLocationFilter] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<Date | undefined>();

    // Unique options for filters
    const [genders, setGenders] = useState<string[]>([]);
    const [mbtiTypes, setMbtiTypes] = useState<string[]>([]);
    const [allHobbies, setAllHobbies] = useState<string[]>([]);
    const [allLocations, setAllLocations] = useState<string[]>([]);

    const fetchUsers = async () => {
        const users = await getAllUsers();
        setAllUsers(users);
    };
    
    const fetchAllTribes = async () => {
        const tribes = await getAllTribes();
        setAllTribes(tribes);
    };

    useEffect(() => {
        fetchUsers();
        fetchAllTribes();
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
        const usersInAnyTribe = new Set<string>();
        allTribes.forEach(tribe => {
            (tribe.members as MatchedUser[]).forEach(member => {
                usersInAnyTribe.add(member.userId);
            });
        });

        let filtered = allUsers.filter(user =>
            user.persona &&
            user.interestedInMeetups &&
            !usersInAnyTribe.has(user.id)
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

        if (dateFilter) {
            const formattedDateFilter = format(dateFilter, 'yyyy-MM-dd');
            filtered = filtered.filter(user =>
                user.availableDates?.includes(formattedDateFilter)
            );
        }

        setEligibleUsers(filtered);
    }, [allUsers, allTribes, genderFilter, mbtiFilter, minAgeFilter, maxAgeFilter, hobbiesFilter, locationFilter, dateFilter]);

    const handleUserSelection = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const calculateCompatibilityScore = (users: User[]): number => {
        if (users.length < 2) return 0;

        let totalScore = 0;
        const numUsers = users.length;

        // Persona Similarity (25%)
        const personaScore = 100;
        totalScore += personaScore * 0.25;

        // Location Proximity (20%)
        const sameLocation = users.every(u => u.location === users[0].location);
        totalScore += (sameLocation ? 100 : 0) * 0.20;

        // Shared Hobbies (20%)
        const allHobbies = users.flatMap(u => u.hobbies || []);
        const uniqueHobbies = [...new Set(allHobbies)];
        const sharedHobbies = uniqueHobbies.filter(h => users.every(u => u.hobbies?.includes(h)));
        const hobbyScore = (uniqueHobbies.length > 0 ? (sharedHobbies.length / uniqueHobbies.length) : 0) * 100;
        totalScore += hobbyScore * 0.20;

        // MBTI Compatibility (15%)
        const mbtiGroups = {
            'Analysts': ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
            'Diplomats': ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
            'Sentinels': ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
            'Explorers': ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
        };
        const groupCounts = Object.values(mbtiGroups).map(group =>
            users.filter(u => u.mbti && group.includes(u.mbti)).length
        );
        const maxGroup = Math.max(...groupCounts);
        const mbtiScore = (maxGroup / numUsers) * 100;
        totalScore += mbtiScore * 0.15;

        // Age Range (10%)
        const ages = users.map(u => calculateAge(u.dob));
        const ageRange = Math.max(...ages) - Math.min(...ages);
        const ageScore = Math.max(0, 100 - (ageRange * 5));
        totalScore += ageScore * 0.10;

        // Gender Balance (10%)
        const genderCounts = users.reduce((acc, u) => {
            acc[u.gender] = (acc[u.gender] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const balance = 1 - (Math.abs(Object.values(genderCounts).reduce((a, b) => a - b, 0)) / numUsers);
        const genderScore = balance * 100;
        totalScore += genderScore * 0.10;

        return Math.round(totalScore);
    };
    
    useEffect(() => {
        if (selectedUsers.length > 1) {
            const users = allUsers.filter(u => selectedUsers.includes(u.id));
            setCompatibilityScore(calculateCompatibilityScore(users));
        } else {
            setCompatibilityScore(0);
        }
    }, [selectedUsers, allUsers]);

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
                compatibilityScore: compatibilityScore, // Individual compatibility for display if needed
                persona: user.persona || "N/A",
                matchReason: "Manually created tribe",
                rsvpStatus: "pending",
            }));

            await createTribe({
                members: matchedUsers,
                meetupDate,
                meetupTime,
                location,
                is_active: false, // Tribes are inactive by default
                overallCompatibilityScore: compatibilityScore,
            });

            toast({ title: "Success", description: "Tribe created successfully and is set to inactive." });
            
            setSelectedUsers([]);
            setMeetupDate("");
            setMeetupTime("");
            setLocation("");
            fetchUsers();
            fetchAllTribes();

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

    const handleTribeStatusChange = async (tribeId: string, is_active: boolean) => {
        try {
            await updateTribe(tribeId, { is_active });
            toast({ title: "Success", description: `Tribe status updated successfully.` });
            fetchAllTribes();
        } catch (error) {
            console.error("Failed to update tribe status:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update tribe status." });
        }
    };

    const handleDeleteTribe = async (tribeId: string, members: MatchedUser[]) => {
        try {
            await deleteTribe(tribeId, members);
            toast({ title: "Success", description: "Tribe deleted successfully." });
            fetchAllTribes();
            fetchUsers(); // To update eligible users list
        } catch (error) {
            console.error("Failed to delete tribe:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not delete tribe." });
        }
    };

    const handleActivateTribes = async () => {
        try {
            const inactiveTribeIds = allTribes.filter(t => !t.is_active).map(t => t.id);
            if (inactiveTribeIds.length === 0) {
                toast({ title: "No Inactive Tribes", description: "There are no inactive tribes to activate." });
                return;
            }
            await updateAllTribesStatus(inactiveTribeIds, true);
            toast({ title: "Success", description: "All inactive tribes have been activated." });
            fetchAllTribes();
        } catch (error) {
            console.error("Failed to activate tribes:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not activate tribes." });
        }
    };

    const handleCleanupTribes = async () => {
        try {
            await deleteInactiveAndArchiveActiveTribes(allTribes);
            toast({ title: "Success", description: "Tribe cleanup completed successfully." });
            fetchAllTribes();
            fetchUsers();
        } catch (error) {
            console.error("Failed to cleanup tribes:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not complete tribe cleanup." });
        }
    };

    const formatAvailableDates = (dates: string[] | undefined) => {
        if (!dates || dates.length === 0) return "N/A";
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingDates = dates
            .map(date => parseISO(date))
            .filter(date => date >= today)
            .sort((a, b) => a.getTime() - b.getTime());

        if (upcomingDates.length === 0) return "None Upcoming";

        return upcomingDates
            .slice(0, 2)
            .map(date => format(date, "MMM d"))
            .join(", ");
    };
    
    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="flex space-x-8">
                <div className="w-2/3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Eligible Users for Tribe Creation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 border rounded-lg">
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

                               <div className="flex items-center space-x-2">
                                   <Label>Age:</Label>
                                    <Input className="w-20" id="min-age-filter" type="number" placeholder="Min" value={minAgeFilter} onChange={e => setMinAgeFilter(e.target.value)} />
                                    <Input className="w-20" id="max-age-filter" type="number" placeholder="Max" value={maxAgeFilter} onChange={e => setMaxAgeFilter(e.target.value)} />
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal",
                                                !dateFilter && "text-muted-foreground"
                                            )}
                                            >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateFilter ? format(dateFilter, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={dateFilter}
                                            onSelect={setDateFilter}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {dateFilter && (
                                    <Button variant="ghost" onClick={() => setDateFilter(undefined)}>Clear</Button>
                                )}
                            </div>

                            <div className="border rounded-lg overflow-auto max-h-[60vh]">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">Select</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Hobbies</TableHead>
                                            <TableHead>Available</TableHead>
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
                                                <TableCell>{formatAvailableDates(user.availableDates)}</TableCell>
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
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button disabled={isLoading || selectedUsers.length === 0} className="w-full">
                                        {isLoading ? "Creating Tribe..." : "Create Tribe"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure you want to create this tribe?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will create a new tribe with the selected users. The tribe will be inactive by default.
                                            <br /><br />
                                            <strong>Compatibility Score: {compatibilityScore}%</strong>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCreateTribe}>
                                            Yes, create tribe
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Tribes ({allTribes.length})</CardTitle>
                    <div className="flex space-x-2">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">Activate Tribes</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will mark all inactive tribes as active and send invitations to the members.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleActivateTribes}>
                                        Yes, proceed
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Cleanup Tribes</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will move all active tribes to the archive and release their members. All currently inactive tribes will be permanently deleted. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCleanupTribes}>
                                        Yes, cleanup tribes
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {allTribes.map(tribe => (
                            <AccordionItem value={tribe.id} key={tribe.id}>
                                <AccordionTrigger>
                                    <div className="flex justify-between w-full pr-4 items-center">
                                        <span>Tribe ID: {tribe.id.substring(0, 8)}...</span>
                                        <div className="flex items-center space-x-4">
                                            <Badge>{(tribe.members as MatchedUser[]).length} Members</Badge>
                                            <Badge variant={tribe.is_active ? "default" : "secondary"}>
                                                {tribe.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                            {tribe.overallCompatibilityScore !== undefined && (
                                                <Badge variant="outline">Comp: {tribe.overallCompatibilityScore}%</Badge>
                                            )}
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id={`status-${tribe.id}`}
                                                checked={tribe.is_active}
                                                onCheckedChange={(is_active) => handleTribeStatusChange(tribe.id, is_active)}
                                            />
                                            <Label htmlFor={`status-${tribe.id}`}>
                                                {tribe.is_active ? "Set to Inactive" : "Set to Active"}
                                            </Label>
                                        </div>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive">Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the tribe and remove all members.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteTribe(tribe.id, tribe.members as MatchedUser[])}>
                                                        Yes, delete it
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                    <p><strong>Formed On:</strong> {new Date(tribe.formedDate as string).toLocaleDateString()}</p>
                                    <p><strong>Meetup:</strong> {new Date(tribe.meetupDate as string).toLocaleString()} at {tribe.location}</p>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Compatibility</TableHead>
                                                <TableHead>RSVP</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(tribe.members as MatchedUser[]).map(member => (
                                                <TableRow key={member.userId}>
                                                    <TableCell>{member.user?.name}</TableCell>
                                                    <TableCell>{member.user?.email}</TableCell>
                                                    <TableCell>{member.compatibilityScore}%</TableCell>
                                                    <TableCell>
                                                        <Badge variant={member.rsvpStatus === 'accepted' ? 'default' : member.rsvpStatus === 'declined' ? 'destructive' : 'secondary'}>
                                                            {member.rsvpStatus}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
