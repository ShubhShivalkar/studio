import { Suspense } from 'react';
import Step1Form from './Step1Form';

export default function Step1Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Step1Form />
    </Suspense>
  );
}
