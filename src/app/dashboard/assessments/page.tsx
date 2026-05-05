"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { apiFetch } from "@/lib/fetcher";
import { formatDate } from "@/lib/utils";
import { useFormErrors } from "@/hooks/use-form-errors";

const NewAssessmentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  course: z.string().min(1, "Please select a course"),
  type: z.enum(["QUIZ", "ASSIGNMENT", "EXAM", "PROJECT"]),
  totalMarks: z
    .number({ message: "Total marks must be a number" })
    .int("Total marks must be a whole number")
    .positive("Total marks must be greater than 0"),
});

interface Assessment {
  _id: string;
  title: string;
  type: "QUIZ" | "ASSIGNMENT" | "EXAM" | "PROJECT";
  totalMarks: number;
  date: string;
  course: { _id: string; title: string; code: string };
  scores: { student: { _id: string; name: string }; marks: number }[];
}

interface CourseLite {
  _id: string;
  title: string;
  code: string;
  students: { _id: string; name: string }[];
}

export default function AssessmentsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "STUDENT";
  const canManage = role === "ADMIN" || role === "MENTOR";

  const { data, isLoading, mutate } = useSWR<Assessment[]>("/api/assessments", apiFetch);
  const { data: courses } = useSWR<CourseLite[]>(canManage ? "/api/courses" : null, apiFetch);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    course: "",
    type: "QUIZ" as Assessment["type"],
    totalMarks: 100,
  });
  const { errors, validate, clearField, clear } =
    useFormErrors(NewAssessmentSchema);

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
      await apiFetch("/api/assessments", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Assessment created");
      setForm({ title: "", course: "", type: "QUIZ", totalMarks: 100 });
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
    if (!confirm("Delete this assessment?")) return;
    try {
      await apiFetch(`/api/assessments/${id}`, { method: "DELETE" });
      toast.success("Assessment deleted");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assessments"
        description="Track quizzes, assignments and exams across your courses."
        action={
          canManage && (
            <Button variant="gradient" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New assessment
            </Button>
          )
        }
      />

      {isLoading ? (
        <Card><CardContent className="p-10 text-center text-[var(--muted-foreground)]">Loading…</CardContent></Card>
      ) : data?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <ClipboardList className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">No assessments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((a) => (
            <Card key={a._id}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <Badge variant="primary">{a.course?.code}</Badge>
                    <h3 className="mt-2 font-semibold">{a.title}</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {a.type} • {a.totalMarks} marks • {formatDate(a.date)}
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete assessment"
                      onClick={() => remove(a._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="mt-3 border-t border-[var(--border)] pt-3 text-sm">
                  {a.scores.length === 0 ? (
                    <span className="text-[var(--muted-foreground)]">No scores recorded</span>
                  ) : (
                    <span className="text-[var(--muted-foreground)]">
                      {a.scores.length} score{a.scores.length !== 1 ? "s" : ""} recorded
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Create assessment"
        description="Add a new assessment to a course."
      >
        <form onSubmit={create} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              invalid={!!errors.title}
              placeholder="Mid-term Quiz"
            />
            <FieldError message={errors.title} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select
                value={form.course}
                onChange={(e) => set("course", e.target.value)}
              >
                <option value="">Select course…</option>
                {courses?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </Select>
              <FieldError message={errors.course} />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.type}
                onChange={(e) => set("type", e.target.value as Assessment["type"])}
              >
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="EXAM">Exam</option>
                <option value="PROJECT">Project</option>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="marks">Total marks</Label>
            <Input
              id="marks"
              type="number"
              min={1}
              value={form.totalMarks}
              onChange={(e) => set("totalMarks", Number(e.target.value))}
              invalid={!!errors.totalMarks}
            />
            <FieldError message={errors.totalMarks} />
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
