
"use client";

import {
  BookText,
  Calendar,
  PenLine,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";
import { currentUser } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { getUser } from "@/services/user-service";

const navLinks = [
  { href: "/journal", label: "Journal", icon: <BookText className="h-5 w-5" /> },
  { href: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
  { href: "/tribe", label: "Tribe", icon: <Users className="h-5 w-5" /> },
  { href: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname(); 
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user, redirect to login
      router.push('/onboarding/step-1');
    } else if (user && (!currentUser || currentUser.id !== user.uid)) {
      // If there is a firebase user but the mock user is not set or is incorrect,
      // fetch the user profile from Firestore and update the mock data object.
      getUser(user.uid).then(profile => {
        if (profile) {
          Object.assign(currentUser, profile);
          // We might need to force a re-render here if components don't update.
          // For now, this direct mutation is how the app is structured.
        } else {
          // Profile doesn't exist, maybe they didn't finish onboarding
          router.push('/onboarding/step-2');
        }
      });
    }
  }, [user, loading, router]);


  if (loading || !user || !currentUser || currentUser.id !== user.uid) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-full max-w-md p-8 space-y-4">
                <p>Loading your soulful session...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/journal" className="flex items-center gap-2 font-semibold">
              <PenLine className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">anuvaad</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === link.href && "bg-muted text-primary"
                  )}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
