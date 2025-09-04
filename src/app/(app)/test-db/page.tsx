
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';

export default function TestDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const testDocRef = doc(db, 'test_connection', 'test-doc');
      
      // 1. Write to the database
      await setDoc(testDocRef, {
        status: 'written',
        timestamp: serverTimestamp(),
      });
      
      // 2. Read from the database
      const docSnap = await getDoc(testDocRef);
      if (!docSnap.exists() || docSnap.data().status !== 'written') {
        throw new Error('Read verification failed.');
      }

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
          Click the button below to perform a test write and read operation.
          This will confirm if your Firebase credentials and security rules are set up correctly.
        </p>
        <Button onClick={handleTestConnection} disabled={isLoading}>
          {isLoading ? 'Testing...' : 'Test Connection'}
        </Button>
      </CardContent>
    </Card>
  );
}
