import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { CreateUserSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";
import { requireRole } from "@/lib/guards";

function generateTempPassword(): string {
  return (
    Math.random().toString(36).slice(-6) +
    Math.random().toString(36).slice(-6).toUpperCase() +
    "!1"
  );
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    const data = CreateUserSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email: data.email }).lean();
    if (existing) return fail("A user with this email already exists", 409);

    const tempPassword = data.password ?? generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 12);

    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
    });

    return ok(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tempPassword,
      },
      201,
    );
  } catch (err) {
    return handleError(err);
  }
}
