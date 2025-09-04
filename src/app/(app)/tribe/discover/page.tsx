
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
import { ArrowLeft, Users, CheckCircle, Clock } from 'lucide-react';
import { discoveredTribes as mockTribes } from '@/lib/mock-data';
import type { DiscoveredTribe, User } from '@/lib/types';
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

const getTribeCategory = (members: User[]): 'Male' | 'Female' | 'Mixed' => {
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

export default function DiscoverTribesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tribes] = useState<DiscoveredTribe[]>(mockTribes);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredTribes = useMemo(() => {
    return tribes.filter(tribe => {
      const status = getTribeStatus(tribe.members.length);
      const category = getTribeCategory(tribe.members);

      const statusMatch = statusFilter === 'all' || status.toLowerCase() === statusFilter;
      const categoryMatch = categoryFilter === 'all' || category.toLowerCase() === categoryFilter;

      return statusMatch && categoryMatch;
    });
  }, [tribes, statusFilter, categoryFilter]);
  
  const handleJoinRequest = (tribeId: string) => {
    toast({
        title: "Request Sent!",
        description: `Your request to join tribe ${tribeId} has been sent for approval.`,
    });
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
          </div>

          <div className="space-y-4">
            {filteredTribes.length > 0 ? (
              filteredTribes.map(tribe => {
                const status = getTribeStatus(tribe.members.length);
                const category = getTribeCategory(tribe.members);
                return (
                  <Card key={tribe.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-lg">Tribe <span className="font-mono text-primary">{tribe.id}</span></h3>
                            <div className="flex gap-2">
                                <Badge variant={status === 'Complete' ? 'default' : 'secondary'}>
                                    {status === 'Complete' ? <CheckCircle className="mr-1.5"/> : <Clock className="mr-1.5"/>}
                                    {status}
                                </Badge>
                                <Badge variant="outline">{category}</Badge>
                            </div>
                        </div>
                        
                        <div className="space-y-1">
                             <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Members</span>
                                <span>{tribe.members.length} / 8</span>
                            </div>
                            <Progress value={(tribe.members.length / 8) * 100} />
                        </div>
                       
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>Compatibility</span>
                                <span>{tribe.compatibilityScore}%</span>
                            </div>
                            <Progress value={tribe.compatibilityScore} />
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
                       <Button className="w-full sm:w-auto mt-2" onClick={() => handleJoinRequest(tribe.id)}>
                            <Users className="mr-2"/>
                            Request to Join
                        </Button>
                    </div>
                  </Card>
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
