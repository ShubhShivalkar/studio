
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { currentUser } from '@/lib/mock-data';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/services/user-service';

export default function Step1Page() {
  const router = useRouter();
  const { email, password, setData } = useOnboardingStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter both email and password.',
      });
      return;
    }
    setIsLoading(true);

    try {
      let userCredential;
      if (isLogin) {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userProfile = await getUser(user.uid);
        if (userProfile) {
            Object.assign(currentUser, userProfile);
            toast({
                title: `Welcome back, ${userProfile.name}!`,
                description: "We're redirecting you to your journal.",
            });
            router.push('/journal');
        } else {
             // This case is unlikely if auth and db are in sync, but good to handle.
             // It means they have an auth record but no db profile.
            setData({ email, password });
            router.push('/onboarding/step-2');
        }

      } else {
        // Sign up new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setData({ email, password });
        router.push('/onboarding/step-2');
      }
    } catch (error: any) {
      console.error(`Error during ${isLogin ? 'login' : 'sign up'}:`, error);
      let description = 'An unexpected error occurred. Please try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
          description = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
          description = 'Password should be at least 6 characters long.';
      }
      
      toast({
        variant: 'destructive',
        title: `${isLogin ? 'Login' : 'Sign Up'} Failed`,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isLogin ? 'Welcome Back!' : "Let's Get Started"}</CardTitle>
        <CardDescription>
          {isLogin ? 'Sign in to continue your journey.' : 'Create an account to begin.'}
        </CardDescription>
        {!isLogin && <Progress value={10} className="mt-2" />}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
           <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. you@example.com"
                required
                value={email}
                onChange={(e) => setData({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setData({ password: e.target.value })}
              />
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : (isLogin ? 'Login' : 'Create Account')}
          </Button>
           <Button variant="link" type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm">
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
