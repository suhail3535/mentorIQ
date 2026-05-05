"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { useFormErrors } from "@/hooks/use-form-errors";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginInput = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const { errors, validate, clearField } = useFormErrors(LoginSchema);

  function set<K extends keyof LoginInput>(k: K, v: LoginInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (res?.error) {
        toast.error("Invalid email or password");
        return;
      }
      toast.success("Signed in");
      router.push(search.get("from") ?? "/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          invalid={!!errors.email}
        />
        <FieldError message={errors.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          invalid={!!errors.password}
        />
        <FieldError message={errors.password} />
      </div>
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
