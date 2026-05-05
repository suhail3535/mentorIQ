import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Intervention } from "@/models/Intervention";
import { InterventionSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await ctx.params;
    await connectDB();
    const i = await Intervention.findById(id)
      .populate("student", "name email")
      .populate("mentor", "name email")
      .populate("course", "title code")
      .lean();
    if (!i) return fail("Intervention not found", 404);

    if (
      session.user.role === "STUDENT" &&
      String(i.student._id ?? i.student) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }
    return ok(i);
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
    const i = await Intervention.findById(id);
    if (!i) return fail("Intervention not found", 404);
    if (
      session.user.role === "MENTOR" &&
      String(i.mentor) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }
    const body = await req.json();
    const data = InterventionSchema.partial().parse(body);
    Object.assign(i, data);
    await i.save();
    return ok(i);
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
    const i = await Intervention.findById(id);
    if (!i) return fail("Intervention not found", 404);
    if (
      session.user.role === "MENTOR" &&
      String(i.mentor) !== session.user.id
    ) {
      return fail("Forbidden", 403);
    }
    await i.deleteOne();
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
