"use client";

import {
  AlarmClock,
  Menu,
  PenLine,
  Plus,
  StickyNote,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/journal", label: "Journal" },
  { href: "/calendar", label: "Calendar" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navLinks.find(link => link.href === pathname)?.label || "Soulful Sync";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col">
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/journal"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <PenLine className="h-6 w-6 text-primary" />
              <span className="font-headline">Soulful Sync</span>
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                  pathname === link.href && "bg-muted text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <h1 className="font-headline text-xl md:text-2xl">{pageTitle}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="primary" size="sm" className="ml-auto gap-1">
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <PenLine className="mr-2 h-4 w-4" />
            <span>New Journal Entry</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <AlarmClock className="mr-2 h-4 w-4" />
            <span>Set Reminder</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <StickyNote className="mr-2 h-4 w-4" />
            <span>Add Note</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
