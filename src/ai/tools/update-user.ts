import { tool } from "ai";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

/**
 * Find a single user by either Mongo _id, exact email, or fuzzy name.
 * Returns { user } when exactly one match is found, or
 * { error } / { candidates } when ambiguous / not found.
 */
async function resolveUser(query: string) {
  await connectDB();
  if (isValidObjectId(query)) {
    const u = await User.findById(query).select("name email role").lean();
    return u ? { user: u } : { error: `No user with id ${query}` };
  }
  const lower = query.trim().toLowerCase();
  const exact = await User.findOne({ email: lower })
    .select("name email role")
    .lean();
  if (exact) return { user: exact };

  const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const candidates = await User.find({
    $or: [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ],
  })
    .select("name email role")
    .limit(5)
    .lean();

  if (candidates.length === 0) {
    return { error: `No user matching "${query}"` };
  }
  if (candidates.length === 1) return { user: candidates[0] };
  return {
    error: `Multiple users match "${query}". Ask the admin which one.`,
    candidates: candidates.map((c) => ({
      id: String(c._id),
      name: c.name,
      email: c.email,
      role: c.role,
    })),
  };
}

export function updateUserTool(actorId: string) {
  return tool({
    description:
      "Update an existing user's name, email, role, or active status. The user can be located by id, email, or name (exact email is preferred to avoid ambiguity). Admins cannot demote themselves.",
    inputSchema: z.object({
      query: z
        .string()
        .min(2)
        .describe(
          "Identifier for the user — Mongo id, email, or name. Email is the most reliable.",
        ),
      name: z.string().min(2).max(80).optional(),
      email: z.string().email().optional(),
      role: z.enum(["ADMIN", "MENTOR", "STUDENT"]).optional(),
      isActive: z.boolean().optional(),
    }),
    execute: async ({ query, name, email, role, isActive }) => {
      const found = await resolveUser(query);
      if ("error" in found) return { ok: false, ...found };

      const target = found.user;
      const updates: Record<string, unknown> = {};
      if (name) updates.name = name;
      if (email) updates.email = email.toLowerCase();
      if (role) updates.role = role;
      if (typeof isActive === "boolean") updates.isActive = isActive;

      if (Object.keys(updates).length === 0) {
        return {
          ok: false,
          error: "No fields provided to update.",
        };
      }

      if (
        String(target._id) === actorId &&
        role &&
        role !== "ADMIN"
      ) {
        return {
          ok: false,
          error:
            "You cannot change your own role away from ADMIN — ask another admin to do it.",
        };
      }

      if (email && email.toLowerCase() !== target.email) {
        const dupe = await User.findOne({ email: email.toLowerCase() })
          .select("_id")
          .lean();
        if (dupe) {
          return {
            ok: false,
            error: `Email ${email} is already used by another user.`,
          };
        }
      }

      const updated = await User.findByIdAndUpdate(target._id, updates, {
        new: true,
        runValidators: true,
      })
        .select("name email role isActive")
        .lean();

      return {
        ok: true,
        user: {
          id: String(updated!._id),
          name: updated!.name,
          email: updated!.email,
          role: updated!.role,
          isActive: updated!.isActive,
        },
        changed: Object.keys(updates),
      };
    },
  });
}
