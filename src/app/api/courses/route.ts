import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/models/Course";
import { CourseSchema } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const filter: Record<string, unknown> = {};
    if (session.user.role === "MENTOR") filter.mentor = session.user.id;
    if (session.user.role === "STUDENT") filter.students = session.user.id;

    const courses = await Course.find(filter)
      .populate("mentor", "name email")
      .populate("students", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return ok(courses);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("ADMIN", "MENTOR");
    const body = await req.json();
    const data = CourseSchema.parse(body);
    await connectDB();

    const mentor =
      session.user.role === "ADMIN" && data.mentor
        ? data.mentor
        : session.user.id;

    const course = await Course.create({
      title: data.title,
      code: data.code,
      description: data.description,
      mentor,
      students: data.students ?? [],
    });
    return ok(course, 201);
  } catch (err) {
    return handleError(err);
  }
}
