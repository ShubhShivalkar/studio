
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const OnboardingStep1 = dynamic(() => import('./OnboardingStep1'), { 
  loading: () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-6 w-1/2" />
      </CardFooter>
    </Card>
  ),
  ssr: false 
});

export default function Step1Page() {
  return (
    <Suspense>
      <OnboardingStep1 />
    </Suspense>
  );
}
