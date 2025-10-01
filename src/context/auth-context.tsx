
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
  setProfile: (profile: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  setProfile: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, authLoading, error] = useAuthState(auth);
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false); // New state for session cookie creation

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const handleAuthChange = async () => {
      if (user) {
        setSessionLoading(true);
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/sessionLogin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });
          // Session cookie created successfully
        } catch (sessionError) {
          console.error("Error creating session cookie:", sessionError);
          // Handle error, maybe log out user or show a warning
        } finally {
          setSessionLoading(false);
        }

        getUser(user.uid).then(userProfile => {
          if (userProfile) {
            setProfile(userProfile);
            Object.assign(currentUser, userProfile);
          } else {
            if (currentUser && currentUser.id === user.uid) {
              setProfile(currentUser);
            } else {
              setProfile(null);
            }
          }
          setProfileLoading(false);
        });
      } else {
        // No user is authenticated
        setProfile(null);
        setProfileLoading(false);
        // Optionally, clear session cookie if it exists when user logs out
        // await fetch('/api/sessionLogout', { method: 'POST' });
      }
    };

    handleAuthChange();
  }, [user, authLoading]);

  const loading = authLoading || profileLoading || sessionLoading;

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, setProfile }}>
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
