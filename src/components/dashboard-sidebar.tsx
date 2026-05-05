"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Lightbulb,
  Brain,
  UserCog,
  Inbox,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP } from "@/lib/config";
import type { UserRole } from "@/models/User";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["ADMIN", "MENTOR", "STUDENT"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["ADMIN"] },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: Inbox, roles: ["ADMIN"] },
  { href: "/dashboard/courses", label: "Courses", icon: BookOpen, roles: ["ADMIN", "MENTOR", "STUDENT"] },
  { href: "/dashboard/assessments", label: "Assessments", icon: ClipboardList, roles: ["ADMIN", "MENTOR", "STUDENT"] },
  { href: "/dashboard/interventions", label: "Interventions", icon: Lightbulb, roles: ["ADMIN", "MENTOR", "STUDENT"] },
  { href: "/dashboard/profile", label: "Profile", icon: UserCog, roles: ["ADMIN", "MENTOR", "STUDENT"] },
];

export function DashboardSidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { data } = useSession();
  const role = data?.user?.role ?? "STUDENT";

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-black/40 lg:hidden",
          open ? "block" : "hidden",
        )}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-[var(--border)] bg-[var(--card)] transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
              <Brain className="h-4 w-4" />
            </span>
            <span>{APP.name}</span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-md p-1.5 hover:bg-[var(--muted)] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-0.5 p-3">
          {NAV.filter((n) => n.roles.includes(role)).map((n) => {
            const active =
              pathname === n.href ||
              (n.href !== "/dashboard" && pathname.startsWith(n.href));
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
                )}
              >
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--border)] p-4">
          <div className="rounded-xl bg-[var(--muted)] p-3 text-xs text-[var(--muted-foreground)]">
            Signed in as{" "}
            <span className="font-medium text-[var(--foreground)]">
              {data?.user?.name ?? "—"}
            </span>
            <span className="ml-1 rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300">
              {role}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
