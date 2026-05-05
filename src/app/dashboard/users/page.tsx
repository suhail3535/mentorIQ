"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { z } from "zod";
import { Trash2, Search, UserPlus, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field-error";
import { apiFetch } from "@/lib/fetcher";
import { formatDate, getInitials } from "@/lib/utils";
import { useFormErrors } from "@/hooks/use-form-errors";

const CreateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["MENTOR", "STUDENT"]),
});

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MENTOR" | "STUDENT";
  isActive: boolean;
  createdAt: string;
}

interface InvitedMentor {
  id: string;
  name: string;
  email: string;
  tempPassword: string;
}

export default function UsersPage() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const url = `/api/users?${new URLSearchParams({
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
  }).toString()}`;
  const { data, isLoading, mutate } = useSWR<UserRow[]>(url, apiFetch);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: "MENTOR" | "STUDENT";
  }>({ name: "", email: "", role: "STUDENT" });
  const [invited, setInvited] = useState<InvitedMentor | null>(null);
  const [copied, setCopied] = useState(false);
  const { errors, validate, clearField, setServerError, clear } =
    useFormErrors(CreateUserSchema);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      const result = await apiFetch<InvitedMentor>("/api/users/create", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success(
        `${form.role === "MENTOR" ? "Mentor" : "Student"} account created`,
      );
      setInvited(result);
      setForm({ name: "", email: "", role: form.role });
      clear();
      mutate();
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg);
      if (msg.toLowerCase().includes("email")) setServerError({ email: msg });
    } finally {
      setSubmitting(false);
    }
  }

  function copyCredentials() {
    if (!invited) return;
    const text = `Email: ${invited.email}\nTemporary password: ${invited.tempPassword}\n\nSign in at: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied");
    setTimeout(() => setCopied(false), 2000);
  }

  function closeModal() {
    setOpen(false);
    setInvited(null);
    setCopied(false);
    clear();
  }

  async function changeRole(id: string, newRole: string) {
    try {
      await apiFetch(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      toast.success("Role updated");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      toast.success("User deleted");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage mentors and students across the workspace."
        action={
          <Button variant="gradient" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Create user
          </Button>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="sm:w-48"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MENTOR">Mentor</option>
            <option value="STUDENT">Student</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--muted)]/40 text-left text-xs uppercase text-[var(--muted-foreground)]">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-5 py-6 text-center text-[var(--muted-foreground)]" colSpan={4}>
                    Loading…
                  </td>
                </tr>
              )}
              {!isLoading && data?.length === 0 && (
                <tr>
                  <td className="px-5 py-10 text-center text-[var(--muted-foreground)]" colSpan={4}>
                    No users found.
                  </td>
                </tr>
              )}
              {data?.map((u) => (
                <tr key={u._id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-semibold text-white">
                        {getInitials(u.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Select
                      value={u.role}
                      onChange={(e) => changeRole(u._id, e.target.value)}
                      className="h-8 w-32 text-xs"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="STUDENT">Student</option>
                    </Select>
                  </td>
                  <td className="px-5 py-3 text-[var(--muted-foreground)]">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.isActive ? (
                      <Badge variant="success" className="mr-2">Active</Badge>
                    ) : (
                      <Badge variant="warning" className="mr-2">Inactive</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(u._id)}
                      aria-label="Delete user"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={closeModal}
        title={invited ? "Account ready" : "Create new user"}
        description={
          invited
            ? "Share these credentials with the user. They can change their password after first sign in."
            : "Create a Mentor or Student account. A temporary password will be generated."
        }
      >
        {invited ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-4 font-mono text-sm">
              <div className="mb-1.5">
                <span className="text-[var(--muted-foreground)]">Name: </span>
                {invited.name}
              </div>
              <div className="mb-1.5">
                <span className="text-[var(--muted-foreground)]">Email: </span>
                {invited.email}
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Password: </span>
                <span className="font-semibold text-indigo-500">
                  {invited.tempPassword}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={copyCredentials}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy credentials
                  </>
                )}
              </Button>
              <Button variant="gradient" onClick={closeModal}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={createUser} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["STUDENT", "MENTOR"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => set("role", r)}
                    className={`rounded-xl border px-3 py-2.5 text-sm transition-all ${
                      form.role === r
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                        : "border-[var(--border)] hover:bg-[var(--muted)]"
                    }`}
                  >
                    {r === "STUDENT" ? "Student" : "Mentor"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-name">Full name</Label>
              <Input
                id="m-name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                invalid={!!errors.name}
              />
              <FieldError message={errors.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-email">Email</Label>
              <Input
                id="m-email"
                type="email"
                placeholder="user@school.edu"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                invalid={!!errors.email}
              />
              <FieldError message={errors.email} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting
                  ? "Creating…"
                  : `Create ${form.role === "MENTOR" ? "mentor" : "student"}`}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
