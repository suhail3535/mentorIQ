import { tool } from "ai";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Course } from "@/models/Course";

export function createCourseTool(adminId: string) {
  return tool({
    description:
      "Create a new course in the workspace. The current Admin is set as the mentor for this course.",
    inputSchema: z.object({
      title: z.string().min(2).max(120).describe("Title of the course"),
      code: z
        .string()
        .min(2)
        .max(20)
        .describe("Short course code, e.g. WEB101 or MATH202"),
      description: z
        .string()
        .max(500)
        .optional()
        .describe("Optional one-line course description"),
    }),
    execute: async ({ title, code, description }) => {
      await connectDB();
      const existing = await Course.findOne({ code: code.toUpperCase() }).lean();
      if (existing) {
        return {
          ok: false,
          error: `A course with code ${code.toUpperCase()} already exists.`,
        };
      }
      const course = await Course.create({
        title,
        code: code.toUpperCase(),
        description,
        mentor: adminId,
        students: [],
      });
      return {
        ok: true,
        course: {
          id: String(course._id),
          title: course.title,
          code: course.code,
        },
      };
    },
  });
}
