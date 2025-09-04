
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function TestDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleTestConnection = async () => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Authenticated',
            description: 'You must be logged in to perform this test.',
        });
        return;
    }
    
    setIsLoading(true);
    try {
      const testDocRef = doc(db, 'users', user.uid);
      const testFieldName = `test_${Date.now()}`;
      
      // 1. Write a temporary field to the user's document
      await updateDoc(testDocRef, {
        [testFieldName]: 'written',
        lastTested: serverTimestamp(),
      });
      
      // 2. Read from the database to verify
      const docSnap = await getDoc(testDocRef);
      if (!docSnap.exists() || docSnap.data()[testFieldName] !== 'written') {
        throw new Error('Read verification failed.');
      }

      toast({
        title: 'Connection Successful!',
        description: 'Successfully wrote to and read from your user document in Firestore.',
        action: <CheckCircle className="text-green-500" />,
      });

    } catch (error) {
      console.error("Database connection test failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: `Could not connect to Firestore. Check console for details. Error: ${errorMessage}`,
        action: <AlertTriangle className="text-white" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
            <Database className="h-8 w-8 text-primary" />
            <div>
                <CardTitle>Test Database Connection</CardTitle>
                <CardDescription>
                    Verify that the app can connect to your Firestore database.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Click the button below to perform a test write and read operation on your user document.
          This will confirm if your Firebase credentials and security rules are set up correctly.
        </p>
        <Button onClick={handleTestConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
      </CardContent>
    </Card>
  );
}
