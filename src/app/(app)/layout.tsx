import {
  BookText,
  HeartHandshake,
  PenLine,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Header } from "@/components/header";

const navLinks = [
  { href: "/journal", label: "Journal", icon: <BookText className="h-5 w-5" /> },
  { href: "/discover", label: "Discover", icon: <Users className="h-5 w-5" /> },
  { href: "/connections", label: "Connections", icon: <HeartHandshake className="h-5 w-5" /> },
  { href: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  // Mocking pathname for active link styling, since usePathname is a client hook
  // In a real app, this part would be client-side to be dynamic.
  // For this static generation, we default to journal.
  const pathname = "/journal"; 

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/journal" className="flex items-center gap-2 font-semibold">
              <PenLine className="h-6 w-6 text-primary" />
              <span className="font-headline text-lg">Soulful Sync</span>
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
