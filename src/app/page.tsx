import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PenLine } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <PenLine className="h-6 w-6 text-primary" />
          <span className="sr-only">Soulful Sync</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                  Soulful Sync
                </h1>
                <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
                  Discover deeper connections with yourself and others through the power of guided journaling and AI-driven personality insights.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/journal">
                    Begin Your Journey
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Connect on a Deeper Level</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform offers a unique approach to forming connections. Explore features designed to foster introspection and meaningful interactions.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <h3 className="text-xl font-bold font-headline">AI-Guided Journaling</h3>
                <p className="text-foreground/80">
                  Engage with our conversational AI that asks thought-provoking questions to guide your reflections.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-xl font-bold font-headline">Persona Creation</h3>
                <p className="text-foreground/80">
                  Let our AI analyze your entries to create a unique personality persona that reflects your inner self.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <h3 className="text-xl font-bold font-headline">Meaningful Matching</h3>
                <p className="text-foreground/80">
                  Connect with others based on genuine personality compatibility, not just superficial interests.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-foreground/60">&copy; 2024 Soulful Sync. All rights reserved.</p>
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
