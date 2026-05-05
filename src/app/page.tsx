import {
  Sparkles,
  Users,
  GraduationCap,
  LineChart,
  ShieldCheck,
  BrainCircuit,
  Layers,
  Database,
  Lock,
} from "lucide-react";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { LandingHeroCTA, LandingFooterCTA } from "@/components/landing-cta";
import { IrisAssistant } from "@/components/ai/iris-assistant";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP } from "@/lib/config";

const features = [
  {
    icon: Users,
    title: "Role-based access",
    desc: "Admin, Mentor and Student roles with secure middleware-enforced permissions.",
  },
  {
    icon: GraduationCap,
    title: "Performance tracking",
    desc: "Capture assessments, scores and trends per student across courses.",
  },
  {
    icon: LineChart,
    title: "Insightful analytics",
    desc: "Charts and dashboards that surface struggling students early.",
  },
  {
    icon: BrainCircuit,
    title: "AI-assisted plans",
    desc: "Generate intervention plans and progress summaries with Gemini.",
  },
  {
    icon: ShieldCheck,
    title: "Production-grade security",
    desc: "Hashed credentials, JWT sessions, validation, sanitization, RBAC.",
  },
  {
    icon: Sparkles,
    title: "Polished UI",
    desc: "Accessible, responsive, dark/light themed interface built with Tailwind.",
  },
];

const stack = [
  { icon: Layers, label: "Next.js 16" },
  { icon: Database, label: "MongoDB + Mongoose" },
  { icon: Lock, label: "NextAuth (JWT)" },
  { icon: BrainCircuit, label: "Gemini AI" },
];

export default function Home() {
  return (
    <>
      <SiteNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.25] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_30%,transparent_80%)]" />
          <div className="absolute inset-0 bg-radial-fade" />

          <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="primary" className="mb-6">
                <Sparkles className="mr-1.5 h-3 w-3" />
                AI-powered edtech platform
              </Badge>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
                Spot struggling students early.{" "}
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Act with confidence.
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-[var(--muted-foreground)]">
                {APP.name} helps mentors track student performance, design data-driven
                intervention plans, and use AI to recommend next steps — all in one
                clean, secure workspace.
              </p>

              <LandingHeroCTA />
            </div>

            {/* Stat strip */}
            <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: "3", v: "Roles" },
                { k: "5+", v: "CRUD modules" },
                { k: "JWT", v: "Auth" },
                { k: "AI", v: "Add-ons" },
              ].map((s) => (
                <div
                  key={s.v}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 text-center backdrop-blur"
                >
                  <div className="text-2xl font-semibold tracking-tight">
                    {s.k}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything mentors need, nothing they don&apos;t
            </h2>
            <p className="mt-4 text-[var(--muted-foreground)]">
              A focused workspace built around the way mentors actually work.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card
                key={f.title}
                className="group transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-indigo-500">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 font-semibold">{f.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="border-y border-[var(--border)] bg-[var(--muted)]/30"
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                A simple, opinionated workflow
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Capture performance",
                  desc: "Mentors create courses, assessments and record scores.",
                },
                {
                  step: "02",
                  title: "Surface risk",
                  desc: "Dashboards highlight students whose performance is dropping.",
                },
                {
                  step: "03",
                  title: "Intervene with AI",
                  desc: "Generate tailored intervention plans and track outcomes.",
                },
              ].map((s) => (
                <Card key={s.step}>
                  <CardContent className="p-6">
                    <div className="mb-3 text-xs font-mono text-indigo-500">
                      {s.step}
                    </div>
                    <h3 className="mb-1.5 font-semibold">{s.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {s.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stack */}
        <section
          id="stack"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built on a modern stack
            </h2>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Production-grade choices, not experiments.
            </p>
          </div>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            {stack.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm"
              >
                <s.icon className="h-4 w-4 text-indigo-500" />
                {s.label}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-xl">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Ready to mentor smarter?
              </h2>
              <p className="max-w-xl text-white/85">
                Spin up your workspace in seconds. No credit card. No setup pain.
              </p>
              <LandingFooterCTA />
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
      <IrisAssistant />
    </>
  );
}
