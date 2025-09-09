
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Feather, Users, BrainCircuit, Check } from 'lucide-react';
import { useState } from "react";

export default function WaitlistPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [ageError, setAgeError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [signupInterest, setSignupInterest] = useState(false);
  const [communicationInterest, setCommunicationInterest] = useState(false);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setDob(newDob);

    if (newDob) {
        const birthDate = new Date(newDob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        if (age < 18) {
            setAgeError("You must be at least 18 years old.");
        } else {
            setAgeError(null);
        }
    } else {
        setAgeError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ageError) {
      return;
    }
    console.log("Waitlist submission:", { name, dob, email, phone, suggestions, signupInterest, communicationInterest });
    setSubmitted(true);
  };

  return (
    (<div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-2">anuvaad's inner circle</h1>
          <p className="text-lg text-muted-foreground">Join the waitlist to get early access.</p>
        </header>

        <hr className="my-12" />

        {/* How it works */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-8">How does it work?</h2>
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                        <Feather className="w-8 h-8 text-primary" />
                        <CardTitle>1. Journal with Anu</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Engage in guided conversations with Anu, your AI companion, to explore your thoughts and feelings.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                        <BrainCircuit className="w-8 h-8 text-primary" />
                        <CardTitle>2. Generate Your Persona</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      After 15 journal entries, our AI analyzes your reflections to create a unique personality persona.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                     <div className="flex items-center gap-4">
                        <Users className="w-8 h-8 text-primary" />
                        <CardTitle>3. Form a Tribe</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Get matched into a small, compatible "Tribe" based on your persona for meaningful connections.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
             <div className="flex justify-center">
               <img src="https://storage.googleapis.com/aai-web-samples/nextjs/anu/journaling-illustration-yellow.svg" alt="Journaling illustration" className="rounded-lg w-full max-w-md" />
            </div>
          </div>
        </section>

        <hr className="my-12" />

        {/* Features */}
        <section className="mb-16">
           <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center md:order-last">
               <img src="https://storage.googleapis.com/aai-web-samples/nextjs/anu/tribe-illustration.svg" alt="Illustration of people talking and laughing" className="rounded-lg w-full max-w-md" />
            </div>
            <div>
                <h2 className="text-3xl font-bold mb-8">Features</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>AI-Guided Journaling</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">A conversational chat interface where you interact with an empathetic AI to explore your day.</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>Personality Persona</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">A detailed persona generated from your journal entries.</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>Tribe Matching</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Automatic matching into small, compatible groups.</p>
                    </CardContent>
                    </Card>
                    <Card>
                    <CardHeader>
                        <CardTitle>Tribe Discovery</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Proactively find and join existing tribes that are not yet full.</p>
                    </CardContent>
                    </Card>
                </div>
            </div>
          </div>
        </section>

        <hr className="my-12" />

        {/* Who's Anu? */}
        <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                     <h2 className="text-3xl font-bold mb-4">Who's Anu?</h2>
                     <p className="text-lg text-muted-foreground leading-relaxed">
                        Anu is your personal AI journaling companion. Designed to be empathetic, curious, and a great listener, Anu guides you through self-reflection with gentle, thoughtful questions. 
                        <br/><br/>
                        The goal isn't to give advice, but to help you uncover your own insights and feelings. Your conversations with Anu are the foundation for building your unique personality persona.
                    </p>
                </div>
                <div className="flex justify-center">
                    <img src="https://storage.googleapis.com/aai-web-samples/nextjs/anu/anu-illustration-woman.svg" alt="Illustration of Anu" className="rounded-lg w-full max-w-xs"/>
                </div>
            </div>
        </section>

        <hr className="my-12" />

        {/* Community Guidelines */}
        <section className="mb-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">Community Guidelines</h2>
            <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6 text-primary" />
                    <CardTitle>Be Respectful</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Treat everyone with kindness and respect. No harassment, bullying, or hate speech.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6 text-primary" />
                    <CardTitle>Stay Authentic</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Engage in genuine and meaningful conversations. Be yourself and share your true thoughts.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6 text-primary" />
                    <CardTitle>Protect Privacy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Do not share personal information about others without their consent. Respect everyone's privacy.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Check className="w-6 h-6 text-primary" />
                    <CardTitle>Keep it Safe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Report any behavior that violates these guidelines. Help us create a safe and supportive community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <hr className="my-12" />

        {/* Join Waitlist CTA */}
        <section>
            <div className="grid md:grid-cols-2 gap-12 items-start">
                <div className="flex flex-col justify-center h-full text-center md:text-left">
                    <h2 className="text-3xl font-bold mb-4">We Value Your Input</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Your journey and feedback are important to us. Whether you have a question, a suggestion, or just want to chat about the future of mindful connection, we're here to listen.
                        <br/><br/>
                        Use the form to join the waitlist, or connect with us directly on WhatsApp.
                    </p>
                </div>
                <div>
                    {!submitted ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Join Our Inner Circle</CardTitle>
                                <CardDescription>Fill out the form below to join the waitlist.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">Date of Birth</Label>
                                        <Input id="dob" type="date" value={dob} onChange={handleDobChange} required />
                                        {ageError && <p className="text-sm text-red-500">{ageError}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone (Optional)</Label>
                                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="suggestions">Suggestions (if any)</Label>
                                        <Textarea id="suggestions" value={suggestions} onChange={(e) => setSuggestions(e.target.value)} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="signup" checked={signupInterest} onCheckedChange={setSignupInterest} />
                                        <Label htmlFor="signup" className="text-sm font-normal">Sign me up directly when available.</Label>
                                    </div>
                                    <div className="items-top flex space-x-2">
                                        <Checkbox id="communication" checked={communicationInterest} onCheckedChange={setCommunicationInterest} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="communication" className="text-sm font-normal">I want to receive communications, news, and alerts.</Label>
                                            <p className="text-sm text-muted-foreground">Don't worry, we won't spam you.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                        <Button type="submit" className="w-full" disabled={!!ageError}>Submit</Button>
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href="https://wa.me/918879154181" target="_blank" rel="noopener noreferrer">Talk with us</a>
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="text-center p-16">
                                <CardTitle className="text-2xl">Thank You!</CardTitle>
                                <CardDescription className="mt-2">
                                    You've been added to our inner circle. We'll be in touch soon!
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </section>
      </div>
    </div>)
  );
}
