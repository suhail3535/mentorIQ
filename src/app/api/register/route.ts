import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { RegisterSchema } from "@/lib/validators";
import { ok, fail, handleError } from "@/lib/api";

/**
 * Public registration is intentionally CLOSED after the workspace is set up.
 * Only the very first user can register — they automatically become ADMIN.
 * After that, all accounts (Mentors and Students) must be created by an
 * Admin from the dashboard. This mirrors how real edtech platforms onboard
 * their staff and learners.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.parse(body);

    await connectDB();

    const userCount = await User.estimatedDocumentCount();
    if (userCount > 0) {
      return fail(
        "Registration is closed. Please contact your workspace admin.",
        403,
      );
    }

    const hashed = await bcrypt.hash(parsed.password, 12);

    const user = await User.create({
      name: parsed.name,
      email: parsed.email,
      password: hashed,
      role: "ADMIN",
    });

    return ok(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      201,
    );
  } catch (err) {
    return handleError(err);
  }
}
