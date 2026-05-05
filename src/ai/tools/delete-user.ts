import { tool } from "ai";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export function deleteUserTool(actorId: string) {
  return tool({
    description:
      "Permanently delete a user account from the workspace. The user can be located by id, email, or name. The current admin cannot delete themselves. Always confirm with the admin before calling this — it cannot be undone.",
    inputSchema: z.object({
      query: z
        .string()
        .min(2)
        .describe(
          "Identifier for the user — Mongo id, email, or name. Email is the most reliable.",
        ),
      confirm: z
        .boolean()
        .describe(
          "Must be true. Set this only after the admin has explicitly confirmed deletion.",
        ),
    }),
    execute: async ({ query, confirm }) => {
      if (!confirm) {
        return {
          ok: false,
          error:
            "Deletion not confirmed. Ask the admin to confirm, then retry with confirm=true.",
        };
      }

      await connectDB();

      let target;
      if (isValidObjectId(query)) {
        target = await User.findById(query).select("name email role").lean();
      } else {
        const lower = query.trim().toLowerCase();
        target = await User.findOne({ email: lower })
          .select("name email role")
          .lean();
        if (!target) {
          const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const matches = await User.find({
            $or: [
              { name: { $regex: escaped, $options: "i" } },
              { email: { $regex: escaped, $options: "i" } },
            ],
          })
            .select("name email role")
            .limit(5)
            .lean();
          if (matches.length === 1) target = matches[0];
          else if (matches.length > 1) {
            return {
              ok: false,
              error: `Multiple users match "${query}". Ask the admin which one (use email for precision).`,
              candidates: matches.map((m) => ({
                id: String(m._id),
                name: m.name,
                email: m.email,
                role: m.role,
              })),
            };
          }
        }
      }

      if (!target) {
        return { ok: false, error: `No user found matching "${query}".` };
      }
      if (String(target._id) === actorId) {
        return {
          ok: false,
          error: "You cannot delete your own account.",
        };
      }

      await User.findByIdAndDelete(target._id);
      return {
        ok: true,
        deleted: {
          id: String(target._id),
          name: target.name,
          email: target.email,
          role: target.role,
        },
      };
    },
  });
}
