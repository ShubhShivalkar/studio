
'use client';

import { useState, useMemo } from 'react';
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
import { discoveredTribes as mockTribes, currentUser } from '@/lib/mock-data';
import type { DiscoveredTribe, User, Tribe } from '@/lib/types';
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
  const [tribes] = useState<DiscoveredTribe[]>(mockTribes);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

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

  const filteredTribes = useMemo(() => {
    return tribes.filter(tribe => {
      const status = getTribeStatus(tribe.members.length);
      const category = getTribeCategory(tribe.members);
      const commonLocation = getMostCommonLocation(tribe.members);

      const statusMatch = statusFilter === 'all' || status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || category.toLowerCase() === categoryFilter;
      const locationMatch = locationFilter === 'all' || commonLocation === locationFilter;

      return statusMatch && categoryMatch && locationMatch;
    });
  }, [tribes, statusFilter, categoryFilter, locationFilter]);
  
  const handleJoinRequest = (tribe: DiscoveredTribe) => {
    const newTribeForStore: Tribe = {
      id: tribe.id,
      members: [
        {
          userId: currentUser.id,
          user: currentUser,
          compatibilityScore: 100,
          persona: currentUser.persona!,
          matchReason: 'This is you!',
          rsvpStatus: 'pending',
        },
        ...tribe.members.map(member => ({
            userId: member.id,
            user: member as User, // Cast for simplicity in mock
            compatibilityScore: tribe.compatibilityScore,
            persona: "A friendly and outgoing individual.", // Mock persona
            matchReason: "Shared interests in art and technology.", // Mock reason
            rsvpStatus: 'pending',
        }))
      ],
      meetupDate: format(new Date(), 'yyyy-MM-dd'),
      meetupTime: '3:00 PM',
      location: getMostCommonLocation(tribe.members) || 'The Cozy Cafe',
    };

    setTribe(newTribeForStore);
    
    toast({
        title: "Request Sent!",
        description: `Your request to join tribe ${tribe.id} has been sent.`,
    });
    
    router.push('/tribe');
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          </div>

          <div className="space-y-4">
            {filteredTribes.length > 0 ? (
              filteredTribes.map(tribe => {
                const status = getTribeStatus(tribe.members.length);
                const category = getTribeCategory(tribe.members);
                const commonLocation = getMostCommonLocation(tribe.members);
                return (
                 <AlertDialog key={tribe.id}>
                  <Card className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg">Tribe <span className="font-mono text-primary">{tribe.id}</span></h3>
                            <div className="flex gap-2">
                                <Badge className={cn('border-transparent text-white', status === 'Complete' ? 'bg-green-500 hover:bg-green-500/80' : 'bg-orange-500 hover:bg-orange-500/80')}>
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
                       
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Compatibility</span>
                            <Badge variant="outline">{tribe.compatibilityScore}%</Badge>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
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
                         {commonLocation && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>{commonLocation}</span>
                            </div>
                        )}
                    </div>
                  </Card>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Join Tribe {tribe.id}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to send a request to join this tribe? This will replace any pending tribe invitations for this week.
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
