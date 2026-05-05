import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { ok, handleError } from "@/lib/api";
import { requireRole } from "@/lib/guards";

export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN", "MENTOR");
    await connectDB();
    const role = req.nextUrl.searchParams.get("role");
    const q = req.nextUrl.searchParams.get("q");

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (q) filter.name = { $regex: q, $options: "i" };

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    return ok(users);
  } catch (err) {
    return handleError(err);
  }
}
