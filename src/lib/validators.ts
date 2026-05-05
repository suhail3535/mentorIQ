import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name is too short").max(80),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  role: z.enum(["ADMIN", "MENTOR", "STUDENT"]).default("STUDENT").optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CourseSchema = z.object({
  title: z.string().min(2).max(120),
  code: z.string().min(2).max(20),
  description: z.string().max(500).optional(),
  mentor: objectId.optional(),
  students: z.array(objectId).optional(),
});
export type CourseInput = z.infer<typeof CourseSchema>;

export const AssessmentSchema = z.object({
  title: z.string().min(2).max(120),
  course: objectId,
  type: z.enum(["QUIZ", "ASSIGNMENT", "EXAM", "PROJECT"]).default("QUIZ"),
  totalMarks: z.number().int().positive(),
  date: z.string().or(z.date()).optional(),
  scores: z
    .array(
      z.object({
        student: objectId,
        marks: z.number().min(0),
        remarks: z.string().max(280).optional(),
      }),
    )
    .optional(),
});
export type AssessmentInput = z.infer<typeof AssessmentSchema>;

export const InterventionSchema = z.object({
  student: objectId,
  course: objectId.optional(),
  reason: z.string().min(5).max(500),
  plan: z.string().min(5).max(2000),
  actions: z
    .array(
      z.object({
        description: z.string().min(2).max(280),
        dueDate: z.string().or(z.date()).optional(),
        completed: z.boolean().optional(),
      }),
    )
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"),
});
export type InterventionInput = z.infer<typeof InterventionSchema>;

export const InquirySchemaZ = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});
export type InquiryInput = z.infer<typeof InquirySchemaZ>;

export const InquiryUpdateSchema = z.object({
  status: z.enum(["NEW", "REPLIED", "CLOSED"]),
});

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  role: z.enum(["MENTOR", "STUDENT"]),
  password: z.string().min(8).max(128).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(280).optional(),
  avatar: z.string().url().optional(),
  role: z.enum(["ADMIN", "MENTOR", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});
