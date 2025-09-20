import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Assuming you have a firebase config for db
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { DiscoveredTribe, User, MatchedUser } from '@/lib/types'; // Assuming these types are defined

export async function GET() {
  try {
    const tribesRef = collection(db, 'tribes');
    const q = query(tribesRef, where('is_active', '==', true)); // Fetch only active tribes
    const querySnapshot = await getDocs(q);

    const discoveredTribes: DiscoveredTribe[] = [];
    const currentYear = new Date().getFullYear();

    for (const docSnapshot of querySnapshot.docs) {
      const tribeData = docSnapshot.data();
      const members: Pick<User, 'id' | 'name' | 'avatar' | 'dob' | 'gender' | 'location' | 'hobbies'>[] = [];
      let totalAge = 0;
      const allHobbies: string[] = [];

      if (tribeData.members && Array.isArray(tribeData.members)) {
        for (const member of tribeData.members as MatchedUser[]) {
          if (member.user) {
            const userData = member.user;
            members.push({
              id: userData.id,
              name: userData.name,
              avatar: userData.avatar || '',
              dob: userData.dob || '',
              gender: userData.gender || 'Prefer not to say',
              location: userData.location || '',
              hobbies: userData.hobbies || [],
            });

            // Calculate age
            if (userData.dob) {
              const birthYear = parseInt(userData.dob.substring(0, 4), 10);
              if (!isNaN(birthYear)) {
                totalAge += (currentYear - birthYear);
              }
            }

            // Collect all hobbies
            if (userData.hobbies && Array.isArray(userData.hobbies)) {
              allHobbies.push(...userData.hobbies);
            }
          }
        }
      }

      const averageAge = members.length > 0 ? Math.round(totalAge / members.length) : 0;

      const hobbyCounts: Record<string, number> = {};
      allHobbies.forEach(hobby => {
          hobbyCounts[hobby] = (hobbyCounts[hobby] || 0) + 1;
      });

      // Common hobbies are those shared by at least two members
      const commonHobbies = Object.keys(hobbyCounts).filter(hobby => hobbyCounts[hobby] > 1);

      discoveredTribes.push({
        id: docSnapshot.id,
        members: members,
        compatibilityScore: tribeData.overallCompatibilityScore || 0,
        commonHobbies: commonHobbies,
        averageAge: averageAge,
      });
    }

    return NextResponse.json(discoveredTribes);
  } catch (error) {
    console.error('Error fetching discovered tribes:', error);
    return NextResponse.json({ message: 'Error fetching discovered tribes', error }, { status: 500 });
  }
}
