
"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { getUser } from '@/services/user-service';
import { currentUser } from '@/lib/mock-data';

interface AuthContextType {
  user: FirebaseUser | null | undefined;
  profile: User | null;
  loading: boolean;
  error?: Error;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, authLoading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      // Still waiting for Firebase to determine auth state
      return;
    }

    if (user) {
      // User is authenticated, now fetch their profile
      getUser(user.uid).then(userProfile => {
        if (userProfile) {
          // Profile found, update our state and the mock object
          setProfile(userProfile);
          Object.assign(currentUser, userProfile);
        } else {
          // Auth record exists but no profile (e.g., incomplete onboarding)
          setProfile(null);
        }
        setProfileLoading(false);
      });
    } else {
      // No user is authenticated
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user, authLoading]);

  const loading = authLoading || profileLoading;

  return (
    <AuthContext.Provider value={{ user, profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
