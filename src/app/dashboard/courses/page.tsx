"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, BookOpen } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { apiFetch } from "@/lib/fetcher";
import { useFormErrors } from "@/hooks/use-form-errors";

const NewCourseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be 20 characters or fewer"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional()
    .or(z.literal("")),
});

interface CourseRow {
  _id: string;
  title: string;
  code: string;
  description?: string;
  mentor: { _id: string; name: string; email: string };
  students: { _id: string; name: string }[];
  createdAt: string;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "STUDENT";
  const canCreate = role === "ADMIN" || role === "MENTOR";

  const { data, isLoading, mutate } = useSWR<CourseRow[]>("/api/courses", apiFetch);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const { errors, validate, clearField, clear } = useFormErrors(NewCourseSchema);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    clearField(k as string);
  }

  function close() {
    setOpen(false);
    clear();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!validate(form)) return;
    setSubmitting(true);
    try {
      await apiFetch("/api/courses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Course created");
      setForm({ title: "", code: "", description: "" });
      clear();
      setOpen(false);
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this course?")) return;
    try {
      await apiFetch(`/api/courses/${id}`, { method: "DELETE" });
      toast.success("Course deleted");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Browse and manage courses in your workspace."
        action={
          canCreate && (
            <Button variant="gradient" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              New course
            </Button>
          )
        }
      />

      {isLoading ? (
        <Card>
          <CardContent className="p-10 text-center text-[var(--muted-foreground)]">
            Loading…
          </CardContent>
        </Card>
      ) : data?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <BookOpen className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              No courses yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((c) => (
            <Card key={c._id} className="group transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <Badge variant="primary">{c.code}</Badge>
                  {canCreate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete course"
                      onClick={() => remove(c._id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <Link href={`/dashboard/courses/${c._id}`} className="block">
                  <h3 className="mb-1 font-semibold tracking-tight">{c.title}</h3>
                  <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
                    {c.description || "No description"}
                  </p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--muted-foreground)]">
                  <span>Mentor: {c.mentor?.name ?? "—"}</span>
                  <span>{c.students?.length ?? 0} students</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Create course"
        description="Add a new course to your workspace."
      >
        <form onSubmit={create} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              invalid={!!errors.title}
              placeholder="Intro to Web Development"
            />
            <FieldError message={errors.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              invalid={!!errors.code}
              placeholder="WEB101"
            />
            <FieldError message={errors.code} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              invalid={!!errors.description}
              placeholder="What is this course about?"
            />
            <FieldError message={errors.description} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
