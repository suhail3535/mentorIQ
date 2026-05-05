import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/models/Course";
import { CourseSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

async function canManage(courseId: string, session: { user: { id: string; role: string } }) {
  if (session.user.role === "ADMIN") return true;
  await connectDB();
  const c = await Course.findById(courseId).select("mentor").lean();
  return !!c && String(c.mentor) === session.user.id;
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await ctx.params;
    await connectDB();
    const course = await Course.findById(id)
      .populate("mentor", "name email")
      .populate("students", "name email")
      .lean();
    if (!course) return fail("Course not found", 404);
    return ok(course);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN", "MENTOR");
    const { id } = await ctx.params;
    if (!(await canManage(id, session))) return fail("Forbidden", 403);

    const body = await req.json();
    const data = CourseSchema.partial().parse(body);
    await connectDB();
    const updated = await Course.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) return fail("Course not found", 404);
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireRole("ADMIN", "MENTOR");
    const { id } = await ctx.params;
    if (!(await canManage(id, session))) return fail("Forbidden", 403);
    await connectDB();
    const deleted = await Course.findByIdAndDelete(id).lean();
    if (!deleted) return fail("Course not found", 404);
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
