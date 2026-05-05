import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Assessment } from "@/models/Assessment";
import { AssessmentSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await ctx.params;
    await connectDB();
    const a = await Assessment.findById(id)
      .populate("course", "title code")
      .populate("scores.student", "name email")
      .lean();
    if (!a) return fail("Assessment not found", 404);
    return ok(a);
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
    await connectDB();
    const a = await Assessment.findById(id);
    if (!a) return fail("Assessment not found", 404);
    if (
      session.user.role === "MENTOR" &&
      String(a.mentor) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }

    const body = await req.json();
    const data = AssessmentSchema.partial().parse(body);
    Object.assign(a, data);
    await a.save();
    return ok(a);
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
    await connectDB();
    const a = await Assessment.findById(id);
    if (!a) return fail("Assessment not found", 404);
    if (
      session.user.role === "MENTOR" &&
      String(a.mentor) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }
    await a.deleteOne();
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
