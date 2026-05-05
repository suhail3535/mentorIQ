import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { InquiryUpdateSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireRole } from "@/lib/guards";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    const body = await req.json();
    const data = InquiryUpdateSchema.parse(body);
    await connectDB();
    const updated = await Inquiry.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    if (!updated) return fail("Inquiry not found", 404);
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
    await requireRole("ADMIN");
    const { id } = await ctx.params;
    await connectDB();
    const deleted = await Inquiry.findByIdAndDelete(id).lean();
    if (!deleted) return fail("Inquiry not found", 404);
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
