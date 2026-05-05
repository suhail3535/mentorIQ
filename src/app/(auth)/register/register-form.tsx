"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { useFormErrors } from "@/hooks/use-form-errors";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});
type RegisterInput = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  });
  const { errors, validate, clearField, setServerError } =
    useFormErrors(RegisterSchema);

  function set<K extends keyof RegisterInput>(k: K, v: RegisterInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;

    startTransition(async () => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error ?? "Registration failed";
        toast.error(msg);
        if (msg.toLowerCase().includes("email")) setServerError({ email: msg });
        return;
      }
      toast.success("Account created");
      const signed = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signed?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          invalid={!!errors.name}
        />
        <FieldError message={errors.name} />
      </div>
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          invalid={!!errors.password}
        />
        <FieldError message={errors.password} />
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 text-xs text-[var(--muted-foreground)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
        <p>
          After this account is created, registration will be closed. All
          future Mentor and Student accounts must be created from the
          Admin&apos;s Users panel.
        </p>
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="lg"
        disabled={isPending}
        className="w-full"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Creating workspace..." : "Create admin account"}
      </Button>
    </form>
  );
}
