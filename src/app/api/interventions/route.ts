import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Intervention } from "@/models/Intervention";
import { InterventionSchema } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const status = req.nextUrl.searchParams.get("status");
    const studentId = req.nextUrl.searchParams.get("student");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (studentId) filter.student = studentId;
    if (session.user.role === "MENTOR") filter.mentor = session.user.id;
    if (session.user.role === "STUDENT") filter.student = session.user.id;

    const items = await Intervention.find(filter)
      .populate("student", "name email")
      .populate("mentor", "name email")
      .populate("course", "title code")
      .sort({ createdAt: -1 })
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
    const data = InterventionSchema.parse(body);
    await connectDB();

    const created = await Intervention.create({
      ...data,
      mentor: session.user.id,
    });
    return ok(created, 201);
  } catch (err) {
    return handleError(err);
  }
}
