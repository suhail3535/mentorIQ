"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Brain } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { APP } from "@/lib/config";

export function SiteNavbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md">
            <Brain className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">{APP.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted-foreground)] md:flex">
          <Link href="/#features" className="hover:text-[var(--foreground)]">
            Features
          </Link>
          <Link href="/#how" className="hover:text-[var(--foreground)]">
            How it works
          </Link>
          <Link href="/#stack" className="hover:text-[var(--foreground)]">
            Stack
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/login">
              <Button variant="gradient" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
