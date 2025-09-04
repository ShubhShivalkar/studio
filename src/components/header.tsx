
"use client";

import {
  AlarmClock,
  Menu,
  PenLine,
  Plus,
  ListTodo,
  BookText,
  Calendar,
  Users,
  UserCircle
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/journal", label: "Journal", icon: <BookText className="h-5 w-5" /> },
  { href: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
  { href: "/tribe", label: "Tribe", icon: <Users className="h-5 w-5" /> },
  { href: "/profile", label: "Profile", icon: <UserCircle className="h-5 w-5" /> },
];

export function Header() {
  const pathname = usePathname();
  const pageTitle = navLinks.find(link => link.href === pathname)?.label || "anuvaad";
  const showNewButton = pathname === '/calendar';

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
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <nav className="grid gap-2 text-lg font-medium">
            <Link
              href="/journal"
              className="flex items-center gap-2 text-lg font-semibold mb-4"
            >
              <PenLine className="h-6 w-6 text-primary" />
              <span className="font-headline">anuvaad</span>
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
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="w-full flex-1">
        <h1 className="font-headline text-xl md:text-2xl">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        {showNewButton && (
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="ml-auto gap-1">
                <Plus className="h-4 w-4" />
                <span>New</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                <Link href="/reminders">
                    <AlarmClock className="mr-2 h-4 w-4" />
                    <span>Set Reminder</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/checklist">
                    <ListTodo className="mr-2 h-4 w-4" />
                    <span>Add Checklist</span>
                </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
