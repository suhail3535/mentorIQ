import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guards";
import { UserUpdateSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await ctx.params;
    if (session.user.role !== "ADMIN" && session.user.id !== id) {
      return fail("Forbidden", 403);
    }
    await connectDB();
    const user = await User.findById(id).select("-password").lean();
    if (!user) return fail("User not found", 404);
    return ok(user);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAuth();
    const { id } = await ctx.params;
    const body = await req.json();
    const data = UserUpdateSchema.parse(body);

    if (session.user.role !== "ADMIN") {
      if (session.user.id !== id) return fail("Forbidden", 403);
      delete data.role;
      delete data.isActive;
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();
    if (!updated) return fail("User not found", 404);
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
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return fail("User not found", 404);
    return ok({ id });
  } catch (err) {
    return handleError(err);
  }
}
