import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assessment } from "@/models/Assessment";
import { Course } from "@/models/Course";
import { AssessmentSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const courseId = req.nextUrl.searchParams.get("course");
    const filter: Record<string, unknown> = {};
    if (courseId) filter.course = courseId;

    if (session.user.role === "MENTOR") filter.mentor = session.user.id;
    if (session.user.role === "STUDENT")
      filter["scores.student"] = session.user.id;

    const items = await Assessment.find(filter)
      .populate("course", "title code")
      .populate("scores.student", "name email")
      .sort({ date: -1 })
      .lean();
    return ok(items);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN", "MENTOR");
    const body = await req.json();
    const data = AssessmentSchema.parse(body);
    await connectDB();

    const course = await Course.findById(data.course).lean();
    if (!course) return fail("Course not found", 404);
    if (
      session.user.role === "MENTOR" &&
      String(course.mentor) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }

    const created = await Assessment.create({
      ...data,
      mentor: course.mentor,
      date: data.date ? new Date(data.date) : new Date(),
    });
    return ok(created, 201);
  } catch (err) {
    return handleError(err);
  }
}
