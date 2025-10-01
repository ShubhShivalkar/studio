
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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
    const groupsCollection = collection(db, 'groups');
    const newGroup: Omit<Group, 'id'> = {
        name,
        members,
        createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(groupsCollection, newGroup);
    return docRef.id;
}
