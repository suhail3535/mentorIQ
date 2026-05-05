import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/models/Course";
import { Assessment } from "@/models/Assessment";
import { User } from "@/models/User";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth } from "@/lib/guards";

/**
 * GET /api/courses/:id/charts
 *
 * Returns chart-ready data for a single course detail page:
 *   - classTrend: average % per assessment, sorted by date
 *   - latestDistribution: per-student score % on the latest assessment
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await ctx.params;
    await connectDB();

    const course = await Course.findById(id).select("students").lean();
    if (!course) return fail("Course not found", 404);

    const assessments = await Assessment.find({ course: id })
      .sort({ date: 1 })
      .select("title date totalMarks scores")
      .lean();

    const classTrend = assessments
      .map((a) => {
        if (!a.scores.length) return null;
        const sumPct = a.scores.reduce(
          (acc, s) => acc + (s.marks / a.totalMarks) * 100,
          0,
        );
        return {
          name: a.title.length > 22 ? a.title.slice(0, 22) + "…" : a.title,
          fullName: a.title,
          date: new Date(a.date).toISOString().slice(0, 10),
          avg: Number((sumPct / a.scores.length).toFixed(1)),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    let latestDistribution: {
      name: string;
      fullName: string;
      pct: number;
    }[] = [];
    let latestTitle: string | null = null;
    const latest = [...assessments]
      .reverse()
      .find((a) => a.scores.length > 0);
    if (latest) {
      latestTitle = latest.title;
      const studentIds = latest.scores.map((s) => s.student);
      const users = await User.find({ _id: { $in: studentIds } })
        .select("name")
        .lean();
      const nameMap = new Map(users.map((u) => [String(u._id), u.name]));
      latestDistribution = latest.scores
        .map((s) => {
          const fullName = nameMap.get(String(s.student)) ?? "Unknown";
          const initials = fullName
            .split(/\s+/)
            .map((p) => p[0]?.toUpperCase() ?? "")
            .join("")
            .slice(0, 3);
          return {
            name: initials || fullName.slice(0, 3),
            fullName,
            pct: Number(((s.marks / latest.totalMarks) * 100).toFixed(1)),
          };
        })
        .sort((a, b) => b.pct - a.pct);
    }

    return ok({
      classTrend,
      latestAssessmentTitle: latestTitle,
      latestDistribution,
    });
  } catch (err) {
    return handleError(err);
  }
}
