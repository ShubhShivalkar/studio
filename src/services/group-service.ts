
'use server';

import { collection, addDoc } from 'firebase/firestore'; // These are no longer needed from client SDK
import { adminDb } from '@/lib/firebase-admin'; 
import { Timestamp } from 'firebase-admin/firestore'; // Import Timestamp from admin SDK

interface Group {
    id?: string;
    name: string;
    members: string[]; // Array of user UIDs
    createdAt: Timestamp;
}

/**
 * Creates a new group in Firestore.
 * @param name The name of the group.
 * @param members An array of user UIDs to include in the group.
 * @returns The ID of the newly created group.
 */
export async function createGroup(name: string, members: string[]): Promise<string> {
    // Use adminDb's collection method and add method
    const groupsCollection = adminDb.collection('groups');
    const newGroup: Omit<Group, 'id'> = {
        name,
        members,
        createdAt: Timestamp.now(),
    };
    console.log("New Group object before sending to Firestore:", newGroup);
    const docRef = await groupsCollection.add(newGroup);
    return docRef.id;
}
