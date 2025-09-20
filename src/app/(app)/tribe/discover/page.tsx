
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveTribes, getTribeScheduleInfo } from "@/services/tribe-service";
import { useAuth } from "@/context/auth-context";
import { Tribe, User } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Calendar, Clock, Globe, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DiscoverPage() {
    const { user, profile } = useAuth();
    const [activeTribes, setActiveTribes] = useState<Tribe[]>([]);
    const [scheduleInfo, setScheduleInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (user) {
                try {
                    const [tribes, schedule] = await Promise.all([
                        getActiveTribes(),
                        getTribeScheduleInfo()
                    ]);
                    setActiveTribes(tribes);
                    setScheduleInfo(schedule);
                } catch (error) {
                    console.error("Failed to fetch discover data:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user]);

    const renderUserAvatar = (member: User | undefined) => {
        if (!member) {
            return (
                <Avatar>
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
            );
        }

        const initial = member.name ? member.name.charAt(0).toUpperCase() : '?';

        return (
            <Avatar>
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
        );
    };

    return (
        <div className="container mx-auto py-10 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Discover New Tribes</h1>
                <p className="text-muted-foreground">Fresh tribes are formed every week. Here are the latest ones.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {[...Array(5)].map((_, j) => (
                                        <Skeleton key={j} className="h-10 w-10 rounded-full" />
                                    ))}
                                </div>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {activeTribes.map((tribe) => (
                            <CarouselItem key={tribe.id} className="md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{tribe.location || "A New Tribe"}</span>
                                                <Badge variant="secondary">{tribe.members.length} members</Badge>
                                            </CardTitle>
                                            <CardDescription>
                                                Formed on {tribe.formedDate ? new Date(tribe.formedDate).toLocaleDateString() : 'a recent date'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {(tribe.members as User[]).slice(0, 5).map(member => (
                                                    <div key={member.id}>
                                                        {renderUserAvatar(member)}
                                                    </div>
                                                ))}
                                                {tribe.members.length > 5 && (
                                                    <Avatar>
                                                        <AvatarFallback>+{tribe.members.length - 5}</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground line-clamp-2">
                                                A group of like-minded individuals ready to connect and share experiences.
                                            </div>
                                        </CardContent>
                                        <div className="p-6 pt-0">
                                            <Button asChild className="w-full" disabled={!profile?.interestedInMeetups}>
                                                <Link href={`/tribe/${tribe.id}`}>
                                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {!profile?.interestedInMeetups && (
                                                <p className="text-xs text-center text-muted-foreground mt-2">
                                                    Enable "Interested in Meetups" in your <Link href="/profile" className="underline">profile</Link> to join.
                                                </p>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            )}

            <Card className="bg-secondary">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calendar /> Tribe Matching Schedule</CardTitle>
                </CardHeader>
                {scheduleInfo && (
                     <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">MATCH DAY</p>
                            <p className="text-lg font-bold flex items-center justify-center gap-2"><Users /> {scheduleInfo.day}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">MATCH TIME</p>
                            <p className="text-lg font-bold flex items-center justify-center gap-2"><Clock /> {scheduleInfo.time}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">TIMEZONE</p>
                            <p className="text-lg font-bold flex items-center justify-center gap-2"><Globe /> {scheduleInfo.timezone}</p>
                        </div>
                    </CardContent>
                )}
            </Card>

             {!profile?.persona && (
                <Card>
                    <CardHeader>
                        <CardTitle>Unlock Your Persona</CardTitle>
                        <CardDescription>
                            Complete your profile by generating your AI-powered persona. This is required to get matched into a tribe.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/profile">Go to Profile</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

