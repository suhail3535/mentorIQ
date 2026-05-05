import { tool } from "ai";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const listUsersTool = tool({
  description:
    "List users in the workspace. Optionally filter by role. Returns up to 50 users plus a total count.",
  inputSchema: z.object({
    role: z
      .enum(["ADMIN", "MENTOR", "STUDENT"])
      .optional()
      .describe("Optional role filter"),
  }),
  execute: async ({ role }) => {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      User.countDocuments(filter),
    ]);
    return {
      ok: true,
      total,
      shown: users.length,
      users: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
      })),
    };
  },
});
