
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';

export function TestDbConnection() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    const testDocId = `test-${Date.now()}`;
    const testDocRef = doc(db, 'test_connection', testDocId);

    try {
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

      toast({
        title: 'Connection Successful!',
        description: 'Successfully wrote to and read from the database.',
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
    <Button onClick={handleTestConnection} disabled={isLoading} variant="outline" size="sm">
      <Database className="mr-2 h-4 w-4" />
      {isLoading ? 'Testing...' : 'Test DB Connection'}
    </Button>
  );
}
