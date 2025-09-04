# Guide: Connecting Soulful Sync to a Firebase Database

This document provides a step-by-step guide for transitioning the Soulful Sync application from using mock data to a live Firebase Firestore database.

---

## Step 1: Set Up Your Firebase Project

Before writing any code, you need a Firebase project with Firestore enabled.

1.  **Create a Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Click "Add project" and follow the on-screen instructions to create a new project.

2.  **Enable Firestore**:
    *   In your new project's dashboard, go to the **Build** section and click on **Firestore Database**.
    *   Click "Create database".
    *   Start in **production mode**. This ensures your data is secure by default.
    *   Choose a location for your database (e.g., `us-central`).

3.  **Register Your Web App**:
    *   Go to **Project Settings** (click the gear icon next to "Project Overview").
    *   Under the "General" tab, scroll down to "Your apps".
    *   Click the web icon (`</>`) to register a new web app.
    *   Give your app a nickname and click "Register app".
    *   Firebase will provide you with a `firebaseConfig` object. **Copy this object.**

---

## Step 2: Configure Environment Variables

Store your Firebase credentials securely.

1.  **Create a `.env.local` file** in the root directory of your project (if it doesn't already exist).
2.  **Add the Firebase config values** to this file. The keys should be prefixed with `NEXT_PUBLIC_` to be accessible on the client side.

    ```bash
    # .env.local

    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    ```

---

## Step 3: Initialize the Firebase SDK

Create a centralized file to initialize Firebase so it can be reused throughout the app.

1.  **Create a file** at `src/lib/firebase.ts`.
2.  **Add the following code** to initialize the Firebase app and export the Firestore and Auth instances.

    ```typescript
    // src/lib/firebase.ts
    import { initializeApp, getApps } from 'firebase/app';
    import { getFirestore } from 'firebase/firestore';
    import { getAuth } from 'firebase/auth';

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

    export const db = getFirestore(app);
    export const auth = getAuth(app);
    ```

---

## Step 4: Define Your Data Model and Security Rules

A good data model is essential for a scalable application. Here is a recommended Firestore collection structure.

### Collections:

*   **`users`**: Stores user profile information.
    *   *Document ID*: `userId` (from Firebase Authentication)
    *   *Fields*: `name`, `dob`, `gender`, `avatar`, `phone`, `persona`, `interestedInMeetups`, etc.
*   **`journalEntries`**: Stores each user's journal summaries.
    *   *Document ID*: Auto-generated ID.
    *   *Fields*: `userId`, `date` (Timestamp), `summary`, `mood`.
*   **`tribes`**: Stores information about created tribes.
    *   *Document ID*: Auto-generated ID.
    *   *Fields*: `memberIds` (Array of user IDs), `meetupDate`, `location`, `rsvp` (Map of userId to status).
*   **`reminders`**: Stores user reminders.
    *   *Document ID*: Auto-generated ID.
    *   *Fields*: `userId`, `date`, `time`, `title`, `details`.
*   **`checklists`**: Stores user checklists.
     *   *Document ID*: Auto-generated ID.
     *   *Fields*: `userId`, `title`, `date`, `items` (Array of objects).


### Security Rules:

Update your Firestore security rules in the Firebase Console to ensure users can only access their own data.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own profile and update it.
    match /users/{userId} {
      allow read, update: if request.auth.uid == userId;
    }
    // Users can read public tribe data.
    match /users/{userId} {
       allow read: if request.auth != null;
    }
    // Users can create, read, update, and delete their own journal entries.
    match /journalEntries/{entryId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    // Add similar rules for reminders, checklists, and tribes.
    match /{document=**} {
      allow read, write: if false; // Deny all other access
    }
  }
}
```

---

## Step 5: Refactor Code to Use Firestore

This is the most significant step. You need to replace all usages of `src/lib/mock-data.ts` with calls to your Firestore database.

1.  **Authentication**:
    *   Replace the mock phone number check in `/onboarding/step-1` with **Firebase Phone Authentication**. You will need to set up the `RecaptchaVerifier`.
    *   Once a user is authenticated, use their `uid` from `auth.currentUser` as the `userId` throughout the app.

2.  **Create Data Service Functions**:
    *   Create service files (e.g., `src/services/userService.ts`, `src/services/journalService.ts`) that contain functions to interact with Firestore.
    *   **Example `userService.ts`**:
        ```typescript
        import { doc, getDoc, setDoc } from 'firebase/firestore';
        import { db } from '@/lib/firebase';
        import type { User } from '@/lib/types';

        export async function getUser(userId: string): Promise<User | null> {
          const userDoc = await getDoc(doc(db, 'users', userId));
          return userDoc.exists() ? (userDoc.data() as User) : null;
        }

        export async function createUser(userId: string, data: Omit<User, 'id'>) {
          await setDoc(doc(db, 'users', userId), data);
        }
        ```

3.  **Update Components and Pages**:
    *   Go through each page (`/profile`, `/calendar`, `/tribe`, etc.) and component that imports from `mock-data`.
    *   Replace the mock data with calls to your new service functions.
    *   Use React's `useState` and `useEffect` hooks to fetch data on component mount. Since this is a Next.js app, prefer fetching data in **Server Components** where possible to improve performance.

    *   **Example: Refactoring Profile Page**
        ```tsx
        // src/app/(app)/profile/page.tsx - (Simplified Example)
        'use client';

        import { useState, useEffect } from 'react';
        import { useAuth } from '@/hooks/useAuth'; // A custom hook to get the current user
        import { getUser } from '@/services/userService';
        import type { User } from '@/lib/types';

        export default function ProfilePage() {
          const { userId } = useAuth();
          const [user, setUser] = useState<User | null>(null);

          useEffect(() => {
            if (userId) {
              getUser(userId).then(setUser);
            }
          }, [userId]);

          if (!user) {
            return <div>Loading...</div>;
          }

          // ... render user profile using the 'user' state object
        }
        ```
---
This guide provides a high-level roadmap. Each step involves careful implementation and testing, but following this structure will lead to a fully functional, database-driven application.
