"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field-error";
import { apiFetch } from "@/lib/fetcher";
import { useFormErrors } from "@/hooks/use-form-errors";

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  bio: z
    .string()
    .max(280, "Bio must be 280 characters or fewer")
    .optional()
    .or(z.literal("")),
  avatar: z
    .string()
    .url("Avatar must be a valid URL (https://…)")
    .optional()
    .or(z.literal("")),
});
type ProfileForm = z.infer<typeof ProfileSchema>;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [form, setForm] = useState<ProfileForm>({ name: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(false);
  const { errors, validate, clearField, setServerError } =
    useFormErrors(ProfileSchema);

  useEffect(() => {
    if (!session?.user?.id) return;
    apiFetch<{ name: string; bio?: string; avatar?: string }>(
      `/api/users/${session.user.id}`,
    )
      .then((u) =>
        setForm({ name: u.name, bio: u.bio ?? "", avatar: u.avatar ?? "" }),
      )
      .catch(() => {});
  }, [session?.user?.id]);

  function set<K extends keyof ProfileForm>(k: K, v: ProfileForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user?.id) return;
    if (!validate(form)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/users/${session.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          bio: form.bio || undefined,
          avatar: form.avatar || undefined,
        }),
      });
      toast.success("Profile updated");
      await update();
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      if (msg.toLowerCase().includes("email")) setServerError({ email: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" description="Update your personal details." />
      <Card>
        <CardContent className="p-6">
          <form onSubmit={save} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                invalid={!!errors.name}
                placeholder="Your full name"
              />
              <FieldError message={errors.name} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                type="url"
                value={form.avatar ?? ""}
                onChange={(e) => set("avatar", e.target.value)}
                invalid={!!errors.avatar}
                placeholder="https://…"
              />
              <FieldError message={errors.avatar} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea
                id="bio"
                value={form.bio ?? ""}
                onChange={(e) => set("bio", e.target.value)}
                invalid={!!errors.bio}
                placeholder="Tell us a little about yourself"
                maxLength={280}
              />
              <div className="flex items-center justify-between">
                <FieldError message={errors.bio} />
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                  {(form.bio ?? "").length}/280
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="gradient" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
