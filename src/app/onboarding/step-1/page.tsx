
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
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { getUser } from '@/services/user-service';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function Step1Page() {
  const router = useRouter();
  const { phone, countryCode, setData } = useOnboardingStore();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);

  const setUpRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    return window.recaptchaVerifier;
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const appVerifier = setUpRecaptcha();
      const fullPhoneNumber = `+${countryCode}${phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: `Please check your phone for the verification code sent to ${fullPhoneNumber}.`,
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to send OTP",
        description: "Please check the phone number and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirmationResult) return;
    setIsLoading(true);

    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;

      // Check if user exists in Firestore
      const existingUser = await getUser(user.uid);
      
      if (existingUser) {
        toast({
          title: `Welcome back, ${existingUser.name}!`,
          description: "We're redirecting you to your journal.",
        });
        router.push('/journal');
      } else {
        setData({ phone, countryCode });
        router.push('/onboarding/step-2');
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast({
        variant: "destructive",
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>{step === 'phone' ? "Welcome! Let's get started." : "Enter Verification Code"}</CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? "First, what's your mobile number? Enter the number to continue."
            : `We sent a code to +${countryCode}${phone}.`}
        </CardDescription>
        <Progress value={step === 'phone' ? 10 : 20} className="mt-2" />
      </CardHeader>
      {step === 'phone' ? (
        <form onSubmit={handleSendOtp}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex items-center gap-2">
                 <div className="flex h-10 items-center rounded-md border border-input bg-background px-3">
                    <span className="text-sm text-muted-foreground">+91</span>
                 </div>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="e.g. 2345678900" 
                  required 
                  value={phone}
                  onChange={(e) => setData({ phone: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Code'}
            </Button>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit Code</Label>
              <Input 
                id="otp" 
                type="text" 
                maxLength={6}
                placeholder="Enter the code" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="gap-2">
            <Button variant="outline" className="w-full" onClick={() => setStep('phone')}>Back</Button>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
          </CardFooter>
        </form>
      )}
      <div id="recaptcha-container" className="my-4 flex justify-center"></div>
    </Card>
  );
}
