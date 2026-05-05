"use client";

import { use, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/fetcher";
import { getInitials } from "@/lib/utils";

interface UserLite { _id: string; name: string; email: string }
interface Course {
  _id: string;
  title: string;
  code: string;
  description?: string;
  mentor: UserLite;
  students: UserLite[];
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const role = session?.user?.role ?? "STUDENT";
  const canManage = role === "ADMIN" || role === "MENTOR";

  const { data: course, mutate } = useSWR<Course>(`/api/courses/${id}`, apiFetch);
  const { data: allStudents } = useSWR<UserLite[]>(
    canManage ? "/api/users?role=STUDENT" : null,
    apiFetch,
  );

  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState("");

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!pick || !course) return;
    const updated = Array.from(new Set([...course.students.map((s) => s._id), pick]));
    try {
      await apiFetch(`/api/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ students: updated }),
      });
      toast.success("Student added");
      setOpen(false);
      setPick("");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  async function removeStudent(studentId: string) {
    if (!course) return;
    if (!confirm("Remove this student from the course?")) return;
    const updated = course.students.filter((s) => s._id !== studentId).map((s) => s._id);
    try {
      await apiFetch(`/api/courses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ students: updated }),
      });
      toast.success("Student removed");
      mutate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="p-10 text-center text-[var(--muted-foreground)]">
          Loading…
        </CardContent>
      </Card>
    );
  }

  const available = (allStudents ?? []).filter(
    (s) => !course.students.some((x) => x._id === s._id),
  );

  return (
    <div>
      <Link
        href="/dashboard/courses"
        className="mb-3 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
      </Link>

      <PageHeader
        title={course.title}
        description={course.description || "No description"}
        action={
          canManage && (
            <Button variant="gradient" onClick={() => setOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add student
            </Button>
          )
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="primary">{course.code}</Badge>
        <Badge variant="outline">Mentor: {course.mentor?.name ?? "—"}</Badge>
        <Badge variant="outline">{course.students.length} students</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {course.students.length === 0 ? (
            <div className="p-10 text-center text-sm text-[var(--muted-foreground)]">
              No students enrolled yet.
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {course.students.map((s) => (
                <li key={s._id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
                      {getInitials(s.name)}
                    </div>
                    <div>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{s.email}</div>
                    </div>
                  </div>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove student"
                      onClick={() => removeStudent(s._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add student"
        description="Pick a student to enroll into this course."
      >
        <form onSubmit={addStudent} className="space-y-4">
          <Select value={pick} onChange={(e) => setPick(e.target.value)} required>
            <option value="">Select a student…</option>
            {available.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — {s.email}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={!pick}>
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
