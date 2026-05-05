import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card className="border-[var(--border)] shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your MentorIQ workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <LoginForm />
        <p className="text-center text-xs text-[var(--muted-foreground)]">
          Don&apos;t have an account? Contact your workspace admin.
        </p>
      </CardContent>
    </Card>
  );
}
