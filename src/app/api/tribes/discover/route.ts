import { NextRequest, NextResponse } from 'next/server';
import { getActiveTribes } from '@/services/tribe-service';
import type { DiscoveredTribe, Tribe, User } from '@/lib/types';
import { differenceInYears, parseISO } from 'date-fns';

const calculateAge = (dob: string): number => {
  const birthDate = parseISO(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export async function GET(request: NextRequest) {
  try {
    const activeTribes = await getActiveTribes();
    const discoveredTribes: DiscoveredTribe[] = [];

    for (const tribe of activeTribes) {
      // Ensure the tribe has members and is active before processing
      if (!tribe.members || tribe.members.length === 0 || !tribe.is_active) {
        continue;
      }

      const memberUsers = tribe.members.map(m => m.user).filter(Boolean) as User[];
      if (memberUsers.length === 0) continue;

      // Calculate average age
      const totalAge = memberUsers.reduce((sum, user) => sum + calculateAge(user.dob), 0);
      const averageAge = Math.round(totalAge / memberUsers.length);

      // Find common hobbies (simple intersection)
      let commonHobbies: string[] = [];
      if (memberUsers.length > 0) {
        commonHobbies = memberUsers[0].hobbies || [];
        for (let i = 1; i < memberUsers.length; i++) {
          const userHobbies = new Set(memberUsers[i].hobbies || []);
          commonHobbies = commonHobbies.filter(hobby => userHobbies.has(hobby));
        }
      }

      // Construct DiscoveredTribe object
      discoveredTribes.push({
        id: tribe.id,
        members: memberUsers.map(user => ({ // Pick only necessary user fields
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          dob: user.dob,
          gender: user.gender,
          location: user.location,
          hobbies: user.hobbies,
        })),
        compatibilityScore: tribe.overallCompatibilityScore || 0, // Use overall score from tribe
        commonHobbies: commonHobbies.slice(0, 3), // Limit to top 3 common hobbies
        averageAge: averageAge,
        meetupDate: tribe.meetupDate, // Include meetupDate
      });
    }

    return NextResponse.json(discoveredTribes, { status: 200 });
  } catch (error) {
    console.error("Error fetching discovered tribes:", error);
    return NextResponse.json({ message: 'Failed to fetch tribes for discovery.' }, { status: 500 });
  }
}
