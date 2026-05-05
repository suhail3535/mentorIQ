"use client";

import useSWR from "swr";
import { useSession } from "next-auth/react";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Lightbulb,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/fetcher";
import { AIAssistantTrigger } from "@/components/ai/ai-assistant";
import { DashboardCharts } from "@/components/charts/dashboard-charts";

interface Stats {
  role: "ADMIN" | "MENTOR" | "STUDENT";
  students?: number;
  mentors?: number;
  courses?: number;
  assessments?: number;
  interventions?: number;
  openInterventions?: number;
  newInquiries?: number;
}

const STAT_CARDS: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; key: keyof Stats; color: string }[]
> = {
  ADMIN: [
    { label: "Students", icon: GraduationCap, key: "students", color: "from-emerald-500 to-teal-500" },
    { label: "Mentors", icon: Users, key: "mentors", color: "from-indigo-500 to-blue-500" },
    { label: "Courses", icon: BookOpen, key: "courses", color: "from-amber-500 to-orange-500" },
    { label: "Assessments", icon: ClipboardList, key: "assessments", color: "from-fuchsia-500 to-pink-500" },
    { label: "Interventions", icon: Lightbulb, key: "interventions", color: "from-violet-500 to-purple-500" },
    { label: "Open issues", icon: AlertTriangle, key: "openInterventions", color: "from-rose-500 to-red-500" },
    { label: "New inquiries", icon: Inbox, key: "newInquiries", color: "from-cyan-500 to-sky-500" },
  ],
  MENTOR: [
    { label: "Students", icon: GraduationCap, key: "students", color: "from-emerald-500 to-teal-500" },
    { label: "My courses", icon: BookOpen, key: "courses", color: "from-amber-500 to-orange-500" },
    { label: "Assessments", icon: ClipboardList, key: "assessments", color: "from-fuchsia-500 to-pink-500" },
    { label: "Interventions", icon: Lightbulb, key: "interventions", color: "from-violet-500 to-purple-500" },
    { label: "Open issues", icon: AlertTriangle, key: "openInterventions", color: "from-rose-500 to-red-500" },
  ],
  STUDENT: [
    { label: "Enrolled courses", icon: BookOpen, key: "courses", color: "from-amber-500 to-orange-500" },
    { label: "Assessments", icon: ClipboardList, key: "assessments", color: "from-fuchsia-500 to-pink-500" },
    { label: "Interventions", icon: Lightbulb, key: "interventions", color: "from-violet-500 to-purple-500" },
  ],
};

export default function DashboardOverviewPage() {
  const { data: session } = useSession();
  const { data, isLoading, error } = useSWR<Stats>("/api/stats", apiFetch);
  const role = session?.user?.role ?? "STUDENT";
  const cards = STAT_CARDS[role] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>
        <AIAssistantTrigger />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => {
          const value = (data?.[c.key] as number | undefined) ?? 0;
          return (
            <Card key={c.label} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md`}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    {c.label}
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {isLoading ? "—" : value}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <Badge variant="danger">Failed to load stats</Badge>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {(error as Error).message}
            </p>
          </CardContent>
        </Card>
      )}

      {(role === "ADMIN" || role === "MENTOR") && <DashboardCharts />}

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-2 font-semibold">Quick start</h2>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            {role === "ADMIN" && (
              <>
                <li>• Invite mentors and students from the Users page.</li>
                <li>• Create courses and assign mentors.</li>
              </>
            )}
            {role === "MENTOR" && (
              <>
                <li>• Create your courses and add students.</li>
                <li>• Add assessments and record scores.</li>
                <li>• Open an intervention for any struggling student.</li>
              </>
            )}
            {role === "STUDENT" && (
              <>
                <li>• Check your enrolled courses and recent assessments.</li>
                <li>• Review any active intervention plans.</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
