"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, Trash2, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field-error";
import { apiFetch } from "@/lib/fetcher";
import { formatDate } from "@/lib/utils";
import { useFormErrors } from "@/hooks/use-form-errors";

const NewInterventionSchema = z.object({
  student: z.string().min(1, "Please select a student"),
  course: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  plan: z.string().min(5, "Plan must be at least 5 characters").max(2000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

interface Intervention {
  _id: string;
  reason: string;
  plan: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  student: { _id: string; name: string };
  mentor: { _id: string; name: string };
  course?: { _id: string; title: string; code: string };
  createdAt: string;
  aiGenerated: boolean;
}

interface UserLite { _id: string; name: string; email: string }
interface CourseLite { _id: string; title: string; code: string }

const PRIORITY_VARIANT: Record<string, "default" | "warning" | "danger" | "primary"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "danger",
};
const STATUS_VARIANT: Record<string, "default" | "warning" | "success" | "primary"> = {
  OPEN: "warning",
  IN_PROGRESS: "primary",
  RESOLVED: "success",
};

export default function InterventionsPage() {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "STUDENT";
  const canManage = role === "ADMIN" || role === "MENTOR";

  const { data, isLoading, mutate } = useSWR<Intervention[]>("/api/interventions", apiFetch);
  const { data: students } = useSWR<UserLite[]>(canManage ? "/api/users?role=STUDENT" : null, apiFetch);
  const { data: courses } = useSWR<CourseLite[]>(canManage ? "/api/courses" : null, apiFetch);

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    student: "",
    course: "",
    reason: "",
    plan: "",
    priority: "MEDIUM" as Intervention["priority"],
  });
  const { errors, validate, clearField, clear } = useFormErrors(
    NewInterventionSchema,
  );

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
      await apiFetch("/api/interventions", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          course: form.course || undefined,
        }),
      });
      toast.success("Intervention created");
      setForm({ student: "", course: "", reason: "", plan: "", priority: "MEDIUM" });
      clear();
      setOpen(false);
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: Intervention["status"]) {
    try {
      await apiFetch(`/api/interventions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this intervention?")) return;
    try {
      await apiFetch(`/api/interventions/${id}`, { method: "DELETE" });
      toast.success("Deleted");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Interventions"
        description="Document, assign and track plans for students who need extra support."
        action={
          canManage && (
            <Button variant="gradient" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> New intervention
            </Button>
          )
        }
      />

      {isLoading ? (
        <Card><CardContent className="p-10 text-center text-[var(--muted-foreground)]">Loading…</CardContent></Card>
      ) : data?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Lightbulb className="h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">No interventions yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data?.map((i) => (
            <Card key={i._id}>
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={PRIORITY_VARIANT[i.priority]}>{i.priority}</Badge>
                      <Badge variant={STATUS_VARIANT[i.status]}>{i.status.replace("_", " ")}</Badge>
                      {i.aiGenerated && <Badge variant="primary">AI</Badge>}
                    </div>
                    <h3 className="mt-2 truncate font-semibold">
                      {i.student?.name}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {i.course ? `${i.course.code} • ` : ""}
                      {formatDate(i.createdAt)}
                    </p>
                  </div>
                  {canManage && (
                    <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(i._id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
                <p className="text-sm">
                  <span className="font-medium">Reason: </span>
                  <span className="text-[var(--muted-foreground)]">{i.reason}</span>
                </p>
                <p className="mt-2 line-clamp-3 text-sm">
                  <span className="font-medium">Plan: </span>
                  <span className="text-[var(--muted-foreground)]">{i.plan}</span>
                </p>
                {canManage && (
                  <div className="mt-4 flex items-center gap-2">
                    <Label className="text-xs text-[var(--muted-foreground)]">Status</Label>
                    <Select
                      value={i.status}
                      onChange={(e) => updateStatus(i._id, e.target.value as Intervention["status"])}
                      className="h-8 w-40 text-xs"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="RESOLVED">Resolved</option>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={close}
        title="New intervention"
        description="Capture why a student needs help and outline an action plan."
      >
        <form onSubmit={create} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select
                value={form.student}
                onChange={(e) => set("student", e.target.value)}
              >
                <option value="">Select student…</option>
                {students?.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </Select>
              <FieldError message={errors.student} />
            </div>
            <div className="space-y-1.5">
              <Label>Course (optional)</Label>
              <Select
                value={form.course}
                onChange={(e) => set("course", e.target.value)}
              >
                <option value="">—</option>
                {courses?.map((c) => (
                  <option key={c._id} value={c._id}>{c.code} — {c.title}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Reason</Label>
            <Input
              value={form.reason}
              onChange={(e) => set("reason", e.target.value)}
              invalid={!!errors.reason}
              placeholder="e.g. Failing recent quizzes in Algebra"
            />
            <FieldError message={errors.reason} />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <Textarea
              value={form.plan}
              onChange={(e) => set("plan", e.target.value)}
              invalid={!!errors.plan}
              placeholder="Outline the steps you'll take to support this student."
              className="min-h-[120px]"
            />
            <FieldError message={errors.plan} />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onChange={(e) =>
                set("priority", e.target.value as Intervention["priority"])
              }
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
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
