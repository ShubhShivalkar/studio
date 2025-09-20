import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getUser } from '@/services/user-service';
import type { Tribe, User, MatchedUser } from '@/lib/types';

// Maximum members a tribe can have, inferred from UI (X / 8)
const MAX_TRIBE_MEMBERS = 8;

export async function POST(request: NextRequest) {
  try {
    const { tribeId, userId } = await request.json();

    if (!tribeId || !userId) {
      return NextResponse.json({ message: 'Missing tribeId or userId in request body.' }, { status: 400 });
    }

    // --- Authentication and Authorization (Assumption: userId is legitimate) ---
    // In a real application, you would verify the userId against the authenticated user's session
    // or token here to prevent one user from adding another without consent.
    // For this task, we proceed assuming the userId from the client is for the authenticated user.

    // 1. Check if the Tribe Exists
    const tribeRef = doc(db, 'tribes', tribeId);
    const tribeDoc = await getDoc(tribeRef);

    if (!tribeDoc.exists()) {
      return NextResponse.json({ message: 'Tribe not found.' }, { status: 404 });
    }

    const tribe = tribeDoc.data() as Tribe;

    // 2. Check if the Tribe is Full
    if (tribe.members.length >= MAX_TRIBE_MEMBERS) {
      return NextResponse.json({ message: 'This tribe is already full.' }, { status: 400 });
    }

    // 3. Check if the User is Already in this specific Tribe
    if (tribe.members.some(member => member.userId === userId)) {
      return NextResponse.json({ message: 'You are already a member of this tribe.' }, { status: 400 });
    }

    // 4. Check if the User is Already in another Active Tribe
    const joiningUser = await getUser(userId);
    if (!joiningUser) {
      return NextResponse.json({ message: 'Joining user profile not found.' }, { status: 404 });
    }

    if (joiningUser.currentTribeId) {
      return NextResponse.json({ message: 'You are already a member of another tribe. Please leave your current tribe to join a new one.' }, { status: 400 });
    }

    // --- Update the Database ---

    // Prepare the new MatchedUser object for the tribe's members array
    // All attributes are read directly from the joiningUser object
    const newMatchedUserForDb: Omit<MatchedUser, 'user'> = {
      userId: userId,
      compatibilityScore: 0, // Default for discover join, can be enhanced with specific calculation
      persona: joiningUser.persona || "N/A",
      matchReason: "Joined via discover page",
      rsvpStatus: "pending",
      isUserJoinedExternally: true, // Mark as true for users joining via discover
      // Additional user attributes to be stored with the MatchedUser in the tribe
      availableDates: joiningUser.availableDates || [],
      avatar: joiningUser.avatar || "",
      dob: joiningUser.dob || "",
      email: joiningUser.email || "",
      gender: joiningUser.gender || "",
      hobbies: joiningUser.hobbies || [],
      interestedInMeetups: joiningUser.interestedInMeetups || false,
      interests: joiningUser.interests || [],
      is_admin: joiningUser.is_admin || false,
      is_sample_user: joiningUser.is_sample_user || false,
      lastActive: joiningUser.lastActive || "",
      lastTribeDate: joiningUser.lastTribeDate || "",
      location: joiningUser.location || "",
      mbti: joiningUser.mbti || "",
      name: joiningUser.name || "",
      profession: joiningUser.profession || "",
      religion: joiningUser.religion || "",
      tribePreferences: joiningUser.tribePreferences || { ageRange: [], gender: "No Preference" },
    };

    // Add the user to the tribe's members array
    await updateDoc(tribeRef, {
      members: arrayUnion(newMatchedUserForDb),
    });

    // Update the user's currentTribeId
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      currentTribeId: tribeId,
    });

    // --- Return a Success Response (with the fully populated updated tribe) ---

    // Fetch the updated tribe document to send back the latest state
    const updatedTribeDoc = await getDoc(tribeRef);
    const updatedTribeData = updatedTribeDoc.data() as Tribe;

    // Manually populate the 'user' field for each member, similar to getCurrentTribe
    const memberPromises = updatedTribeData.members.map(async (member) => {
      const memberUser = await getUser(member.userId);
      return {
        ...member,
        user: memberUser, // Populate the user object for client consumption
      };
    });

    const populatedMembers = (await Promise.all(memberPromises)).filter(m => m.user);
    const populatedTribe = { ...updatedTribeData, members: populatedMembers };

    return NextResponse.json(populatedTribe, { status: 200 });

  } catch (error) {
    console.error('Failed to handle join tribe request:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}