import { tool } from "ai";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const listUsersTool = tool({
  description:
    "List users in the workspace. Optionally filter by role and search by name/email. Returns up to 50 users plus a total count.",
  inputSchema: z.object({
    role: z
      .enum(["ADMIN", "MENTOR", "STUDENT"])
      .optional()
      .describe("Optional role filter"),
    query: z
      .string()
      .min(2)
      .optional()
      .describe("Optional search text for user name or email"),
  }),
  execute: async ({ role, query }) => {
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (query?.trim()) {
      const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }
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
