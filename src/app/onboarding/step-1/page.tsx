
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useOnboardingStore from '@/store/onboarding';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useCallback } from 'react';
import { currentUser } from '@/lib/mock-data';
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUser } from '@/services/user-service';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function Step1Page() {
  const router = useRouter();
  const { phone, setData } = useOnboardingStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const setupRecaptcha = useCallback(() => {
    if (!auth || window.recaptchaVerifier) return;
    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    } catch (error) {
      console.error("Error setting up reCAPTCHA:", error);
      toast({
          variant: "destructive",
          title: "reCAPTCHA Error",
          description: "Could not initialize reCAPTCHA. Please refresh the page.",
      });
    }
  }, [toast]);

  useEffect(() => {
    setupRecaptcha();
  }, [setupRecaptcha]);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number.",
      });
      return;
    }
    setIsLoading(true);

    const phoneNumber = `+91${phone}`;
    const appVerifier = window.recaptchaVerifier;

    if (!appVerifier) {
       toast({
        variant: "destructive",
        title: "reCAPTCHA Not Ready",
        description: "Please wait a moment and try again.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to Send OTP",
        description: "Could not send verification code. Please check the phone number or try again later.",
      });
       // Reset reCAPTCHA
      window.recaptchaVerifier?.render().then((widgetId) => {
        if (window.grecaptcha) {
            window.grecaptcha.reset(widgetId);
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "Please enter the 6-digit code.",
        });
        return;
    }
    setIsLoading(true);
    try {
        const confirmationResult = window.confirmationResult;
        if (!confirmationResult) {
            throw new Error("No confirmation result found.");
        }
        const result = await confirmationResult.confirm(otp);
        const user = result.user;

        const userProfile = await getUser(user.uid);
        if (userProfile) {
            Object.assign(currentUser, userProfile);
            toast({
                title: `Welcome back, ${userProfile.name}!`,
                description: "We're redirecting you to your journal.",
            });
            router.push('/journal');
        } else {
            setData({ phone, countryCode: '91' });
            router.push('/onboarding/step-2');
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        toast({
            variant: "destructive",
            title: "OTP Verification Failed",
            description: "The code you entered is incorrect. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) {
      handleVerifyOtp();
    } else {
      handleSendOtp();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome! Let's get started.</CardTitle>
        <CardDescription>
          {otpSent ? 'Enter the OTP we sent to your phone.' : "First, what's your mobile number?"}
        </CardDescription>
        <Progress value={otpSent ? 20 : 10} className="mt-2" />
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          {!otpSent ? (
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
                  onChange={(e) => setData({ phone: e.target.value.replace(/\D/g, '') })}
                  className="flex-1"
                  maxLength={10}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
              />
            </div>
          )}
          <div id="recaptcha-container"></div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : (otpSent ? 'Verify & Continue' : 'Send OTP')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
