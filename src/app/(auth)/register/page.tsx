import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { RegisterForm } from "./register-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const metadata: Metadata = { title: "Set up workspace" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await connectDB();
  const userCount = await User.estimatedDocumentCount();

  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <Card className="border-[var(--border)] shadow-xl">
      <CardHeader>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">Set up your workspace</CardTitle>
        <CardDescription>
          You&apos;re the first user — this account will become the{" "}
          <strong>workspace Admin</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RegisterForm />
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          Already set up?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
