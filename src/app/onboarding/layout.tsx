import { PenLine } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <header className="absolute top-0 left-0 w-full px-4 lg:px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <PenLine className="h-6 w-6 text-primary" />
           <span className="font-headline text-lg ml-2">Soulful Sync</span>
        </Link>
      </header>
      <main className="w-full max-w-md">
        {children}
      </main>
    </div>
  );
}
