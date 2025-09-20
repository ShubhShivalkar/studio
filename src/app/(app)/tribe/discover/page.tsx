'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, CheckCircle, Clock, MapPin } from 'lucide-react';
import type { DiscoveredTribe, User, Tribe, MatchedUser } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
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
import useTribeStore from '@/store/tribe';
import { format } from 'date-fns';
import { useAuth } from '@/context/auth-context'; // Assuming an auth context for current user

const getTribeCategory = (members: Pick<User, 'gender'>[]): 'Male' | 'Female' | 'Mixed' => {
  const genders = members.map(m => m.gender);
  const hasMale = genders.includes('Male');
  const hasFemale = genders.includes('Female');
  if (hasMale && hasFemale) return 'Mixed';
  if (hasMale) return 'Male';
  if (hasFemale) return 'Female';
  return 'Mixed'; // Default for tribes with 'Other' or 'Prefer not to say'
};

const getTribeStatus = (memberCount: number): 'Complete' | 'Partial' => {
  return memberCount > 4 ? 'Complete' : 'Partial';
};

const getMostCommonLocation = (members: Pick<User, 'location'>[]): string | null => {
  const locations = members.map(m => m.location).filter(Boolean) as string[];
  if (locations.length === 0) return null;

  const locationCounts = locations.reduce((acc, loc) => {
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b);
};

const categorySymbols = {
  Male: '♂',
  Female: '♀',
  Mixed: '♂♀',
};


export default function DiscoverTribesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setTribe } = useTribeStore();
  const { profile } = useAuth(); // Get current user profile from auth context
  const [tribes, setTribes] = useState<DiscoveredTribe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    const fetchTribes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/tribes/discover');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DiscoveredTribe[] = await response.json();
        setTribes(data);
      } catch (e: any) {
        setError(e.message);
        toast({
          title: "Error fetching tribes",
          description: e.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTribes();
  }, [toast]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    tribes.forEach(tribe => {
        const commonLocation = getMostCommonLocation(tribe.members);
        if (commonLocation) {
            locations.add(commonLocation);
        }
    });
    return Array.from(locations);
  }, [tribes]);

  const filteredAndSortedTribes = useMemo(() => {
    const filtered = tribes.filter(tribe => {
      const status = getTribeStatus(tribe.members.length);
      const category = getTribeCategory(tribe.members);
      const commonLocation = getMostCommonLocation(tribe.members);

      // UI Filter Matches
      const statusMatch = statusFilter === 'all' || status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || category.toLowerCase() === categoryFilter;
      const locationMatch = locationFilter === 'all' || commonLocation === locationFilter;

      // Mandatory Gender Filter Logic
      let genderFilterMatch = true; // Default to true for users with 'Other' gender or if user is not loaded
      if (profile?.gender === 'Male') {
        genderFilterMatch = category === 'Male' || category === 'Mixed';
      } else if (profile?.gender === 'Female') {
        genderFilterMatch = category === 'Female' || category === 'Mixed';
      }

      return statusMatch && categoryMatch && locationMatch && genderFilterMatch;
    });

    switch (sortBy) {
        case 'compatibility_desc':
            return filtered.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        case 'members_desc':
            return filtered.sort((a, b) => b.members.length - a.members.length);
        case 'members_asc':
            return filtered.sort((a, b) => a.members.length - b.members.length);
        default:
            return filtered;
    }

  }, [tribes, statusFilter, categoryFilter, locationFilter, sortBy, profile]);

  const handleJoinRequest = async (tribe: DiscoveredTribe) => {
    if (!profile) {
      toast({
        title: "Authentication required",
        description: "Please log in to join a tribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/tribes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tribeId: tribe.id, userId: profile.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send join request.');
      }

      const updatedTribe: Tribe = await response.json();

      setTribe(updatedTribe); // Update the global tribe store

      toast({
          title: "Hurray! 🎉",
          description: "You've been invited to join the event.",
      });

      router.push('/tribe');
    } catch (e: any) {
      toast({
        title: "Failed to join tribe",
        description: e.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Discover Tribes</CardTitle>
            <CardDescription>
              Finding tribes that match your vibe...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-16">Loading tribes...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Discover Tribes</CardTitle>
            <CardDescription>
              Find and request to join existing tribes that match your vibe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-red-500 py-16">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Discover Tribes</CardTitle>
              <CardDescription>
                Find and request to join existing tribes that match your vibe.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
              <ArrowLeft className="mr-2" /> Back to My Tribe
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="status-filter" className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
               <label htmlFor="category-filter" className="text-sm font-medium">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex-1">
               <label htmlFor="location-filter" className="text-sm font-medium">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger id="location-filter">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="flex-1">
               <label htmlFor="sort-by" className="text-sm font-medium">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="compatibility_desc">Compatibility (High to Low)</SelectItem>
                  <SelectItem value="members_desc">Members (High to Low)</SelectItem>
                  <SelectItem value="members_asc">Members (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAndSortedTribes.length > 0 ? (
              filteredAndSortedTribes.map(tribe => {
                const status = getTribeStatus(tribe.members.length);
                const category = getTribeCategory(tribe.members);
                const commonLocation = getMostCommonLocation(tribe.members);
                return (
                 <AlertDialog key={tribe.id}>
                  <Card className="p-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                              <h3 className="font-semibold text-lg">Tribe <span className="font-mono text-primary">{tribe.id}</span></h3>
                              <div className="flex gap-2">
                                  <Badge className={cn('border-transparent', status === 'Complete' ? 'bg-green-500 hover:bg-green-500/80 text-white' : 'bg-orange-500 hover:bg-orange-500/80 text-white')}>
                                      {status === 'Complete' ? <CheckCircle className="mr-1.5"/> : <Clock className="mr-1.5"/>}
                                      {status}
                                  </Badge>
                                  <Badge variant="outline">{categorySymbols[category]}</Badge>
                              </div>
                          </div>

                          <div className="space-y-1">
                               <div className="flex justify-between items-center text-sm text-muted-foreground">
                                  <span>Members</span>
                                  <span>{tribe.members.length} / 8</span>
                              </div>
                              <Progress value={(tribe.members.length / 8) * 100} />
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Average Age</span>
                              <Badge variant="outline">{tribe.averageAge} years</Badge>
                          </div>

                          {tribe.commonHobbies && tribe.commonHobbies.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="text-muted-foreground">Common Hobbies:</span>
                              {tribe.commonHobbies.map(hobby => (
                                <Badge key={hobby} variant="secondary">{hobby}</Badge>
                              ))}
                            </div>
                          )}

                          {commonLocation && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{commonLocation}</span>
                              </div>
                          )}
                      </div>
                      <div className="flex flex-col items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                          <div className="flex -space-x-2 overflow-hidden">
                              {tribe.members.slice(0, 5).map(member => (
                                  <Avatar key={member.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                      <AvatarImage src={member.avatar} alt={member.name} data-ai-hint="person photo" />
                                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                              ))}
                          </div>
                          <AlertDialogTrigger asChild>
                             <Button className="w-full sm:w-auto mt-2">
                                  <Users className="mr-2"/>
                                  Join Tribe
                              </Button>
                          </AlertDialogTrigger>
                      </div>
                    </div>
                  </Card>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Join Tribe {tribe.id}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Woohoo! You wouldn't regret this. Just FYI, You wouldn't be able to join other tribe this week after joining.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleJoinRequest(tribe)}>
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )
              })
            ) : (
                <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                    <Users className="h-10 w-10 mb-4" />
                    <p>No tribes found matching your criteria.</p>
                    <p className="text-sm">Try adjusting the filters.</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}