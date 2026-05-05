"use client";

import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";
import { getInitials } from "@/lib/utils";

export function DashboardTopbar({ onMenu }: { onMenu: () => void }) {
  const { data } = useSession();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Open sidebar"
        className="rounded-md p-2 hover:bg-[var(--muted)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] py-1 pl-1 pr-3">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
            {getInitials(data?.user?.name ?? "U")}
          </div>
          <span className="hidden text-sm sm:inline">
            {data?.user?.name?.split(" ")[0]}
          </span>
        </div>
        <SignOutButton variant="outline" />
      </div>
    </header>
  );
}
