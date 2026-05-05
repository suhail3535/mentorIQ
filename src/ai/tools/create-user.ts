import bcrypt from "bcryptjs";
import { tool } from "ai";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

function generateTempPassword(): string {
  return (
    Math.random().toString(36).slice(-6) +
    Math.random().toString(36).slice(-6).toUpperCase() +
    "!1"
  );
}

export const createUserTool = tool({
  description:
    "Create a new Mentor or Student account in the workspace. Generates a temporary password that the Admin should share with the user.",
  inputSchema: z.object({
    name: z.string().min(2).max(80).describe("Full name of the user"),
    email: z.string().email().describe("Unique email address"),
    role: z
      .enum(["MENTOR", "STUDENT"])
      .describe("Role to assign — MENTOR or STUDENT"),
  }),
  execute: async ({ name, email, role }) => {
    await connectDB();
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return {
        ok: false,
        error: `A user with email ${email} already exists.`,
      };
    }
    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });
    return {
      ok: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tempPassword,
    };
  },
});
