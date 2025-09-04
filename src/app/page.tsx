import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenLine, Bot, Users, Edit, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center absolute top-0 left-0 w-full z-10">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <PenLine className="h-6 w-6 text-primary" />
          <span className="sr-only">anuvaad - Translate your experiences into real meaningful connections</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative">
          <div className="absolute inset-0 z-0">
            <svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="200" cy="150" r="250" fill="hsla(var(--primary)/0.05)" />
              <circle cx="800" cy="450" r="200" fill="hsla(var(--accent)/0.1)" />
            </svg>
          </div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-1 text-center">
              <h1 className="font-headline text-4xl font-normal tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                anuvaad
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Translate your experiences into real meaningful connections
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg">
                <Link href="/onboarding/step-1">
                  Begin Your Journey
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-headline font-light tracking-tighter sm:text-5xl">Connect on a Deeper Level</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a unique approach to forming connections. Explore features designed to foster introspection and meaningful interactions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
               <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Edit className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">AI-Guided Journaling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    Engage with our conversational AI that asks thought-provoking questions to guide your reflections.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Persona Creation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    Let our AI analyze your entries to create a unique personality persona that reflects your inner self.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                   <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline mt-4">Meaningful Matching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">
                    Connect with others based on genuine personality compatibility, not just superficial interests.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
               <div className="flex justify-center">
                 <Avatar className="w-48 h-48 border-8 border-primary/10">
                  <AvatarImage src="https://picsum.photos/seed/indian-woman/200/200" alt="Anu" data-ai-hint="indian woman" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-6xl">
                    <Heart />
                  </AvatarFallback>
                </Avatar>
               </div>
              <div className="space-y-4">
                 <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Your AI Companion</div>
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">Meet Anu</h2>
                <p className="text-foreground/80 md:text-lg">
                  Anu is a gentle and caring companion with a very empathetic nature. She is understanding and curious about you. Instead of giving advice, she prefers to listen, asking thoughtful questions to help you explore your own thoughts and feelings.
                </p>
                <p className="text-foreground/80 md:text-lg">
                   Her goal is to make you feel comfortable and warm, subtly learning about your personality and interests to help create a persona that truly reflects who you are.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 anuvaad. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
