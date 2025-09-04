
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';

const TEST_TIMEOUT = 10000; // 10 seconds

export function TestDbConnection() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    const testDocId = `test-${Date.now()}`;
    const testDocRef = doc(db, 'test_connection', testDocId);

    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('timeout')), TEST_TIMEOUT);
    });

    try {
      const testPromise = async () => {
        // 1. Write to the database
        await setDoc(testDocRef, {
          status: 'testing',
          timestamp: serverTimestamp(),
        });

        // 2. Read from the database to verify
        const docSnap = await getDoc(testDocRef);
        if (!docSnap.exists() || docSnap.data().status !== 'testing') {
          throw new Error('Read verification failed.');
        }

        // 3. Clean up the test document
        await deleteDoc(testDocRef);
      };

      await Promise.race([testPromise(), timeoutPromise]);

      clearTimeout(timeoutId!); // Clear the timeout if the promise resolves

      toast({
        title: 'Connection Successful!',
        description: 'Successfully wrote to and read from the database.',
        action: <CheckCircle className="text-green-500" />,
      });
    } catch (error) {
      clearTimeout(timeoutId!); // Clear the timeout if the promise rejects
      console.error("Database connection test failed:", error);
      let description = 'Could not connect to Firestore. Check the console for details.';
      
      if (error instanceof Error) {
        if (error.message === 'timeout') {
          description = 'The connection timed out. Please verify your Firestore security rules allow writes to the "test_connection" collection and try again.';
        } else if (error.message.includes('permission-denied')) {
          description = 'Permission denied. Please check your Firestore security rules to ensure they allow writes to the "test_connection" collection.';
        } else {
            description = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: description,
        action: <AlertTriangle className="text-white" />,
        duration: 10000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTestConnection} disabled={isLoading} variant="outline" size="sm">
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? 'Testing...' : 'Test DB Connection'}
    </Button>
  );
}
