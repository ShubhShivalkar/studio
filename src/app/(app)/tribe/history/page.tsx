
"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Calendar, MapPin, Check, X, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getArchivedTribes } from '@/services/tribe-service';
import type { Tribe } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function TribeHistoryPage() {
    const { user } = useAuth();
    const [history, setHistory] = useState<Tribe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            if (user) {
                try {
                    const pastTribes = await getArchivedTribes(user.uid);
                    setHistory(pastTribes);
                } catch (error) {
                    console.error("Failed to fetch tribe history:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchHistory();
    }, [user]);

    const getRsvpStatus = (tribe: Tribe) => {
        const currentUser = tribe.members.find(member => member.userId === user?.uid);
        if (!currentUser) return { icon: <HelpCircle className="text-gray-500" />, label: 'Unknown' };

        switch (currentUser.rsvpStatus) {
            case 'accepted':
                return { icon: <Check className="text-green-500" />, label: 'Accepted' };
            case 'rejected':
                return { icon: <X className="text-red-500" />, label: 'Declined' };
            default:
                return { icon: <HelpCircle className="text-yellow-500" />, label: 'Pending' };
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Meetup History</CardTitle>
                        <CardDescription>A record of your past tribe meetups.</CardDescription>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/tribe">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tribe
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : history.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead><Calendar className="inline-block mr-2 h-4 w-4" />Date</TableHead>
                                <TableHead><MapPin className="inline-block mr-2 h-4 w-4" />Location</TableHead>
                                <TableHead><Users className="inline-block mr-2 h-4 w-4" />Members</TableHead>
                                <TableHead>Your RSVP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.map((tribe) => {
                                const rsvp = getRsvpStatus(tribe);
                                return (
                                    <TableRow key={tribe.id}>
                                        <TableCell>{format(new Date(tribe.meetupDate), 'PPP')}</TableCell>
                                        <TableCell>{tribe.location}</TableCell>
                                        <TableCell>{tribe.members.length}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                rsvp.label === 'Accepted' ? 'default' : 
                                                rsvp.label === 'Declined' ? 'destructive' : 'secondary'
                                            }>
                                                {rsvp.icon}
                                                <span className="ml-1">{rsvp.label}</span>
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">You have no past tribe events.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
