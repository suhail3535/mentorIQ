import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Assessment } from "@/models/Assessment";
import { Intervention } from "@/models/Intervention";
import { ok, fail, handleError } from "@/lib/api";
import { requireAuth } from "@/lib/guards";

/**
 * GET /api/stats/charts
 *
 * Returns chart-ready aggregations for the Dashboard Overview page.
 * Scoped to ADMIN/MENTOR. Students get a 403 (no charts shown to them).
 */
export async function GET() {
  try {
    const session = await requireAuth();
    if (session.user.role === "STUDENT")
      return fail("Charts are only available to mentors and admins.", 403);

    await connectDB();
    const isAdmin = session.user.role === "ADMIN";
    const uid = session.user.id;

    // -------- 1) Workspace growth: users created over the last 30 days.
    // Anchor everything on UTC midnight so day-bucket keys match the keys
    // returned by Mongo's $dateToString (which is UTC by default).
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const since = new Date(todayUTC);
    since.setUTCDate(since.getUTCDate() - 29);

    const userMatch: Record<string, unknown> = { createdAt: { $gte: since } };
    if (!isAdmin) {
      // Mentors only see students in their courses
      const myCourses = await Course.find({ mentor: uid }).select("students").lean();
      const studentIds = new Set<string>();
      myCourses.forEach((c) => c.students.forEach((s) => studentIds.add(String(s))));
      userMatch._id = {
        $in: Array.from(studentIds).map((s) => new Types.ObjectId(s)),
      };
    }

    const newUsers = await User.aggregate<{
      _id: { d: string; role: string };
      count: number;
    }>([
      { $match: userMatch },
      {
        $group: {
          _id: {
            d: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            role: "$role",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build a 30-day series ending on today (UTC), even when no users
    // were created on a given day.
    const days: { date: string; STUDENT: number; MENTOR: number; ADMIN: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, STUDENT: 0, MENTOR: 0, ADMIN: 0 });
    }
    const dayIndex = new Map(days.map((d, i) => [d.date, i]));
    for (const row of newUsers) {
      const idx = dayIndex.get(row._id.d);
      if (idx === undefined) continue;
      const role = row._id.role as "STUDENT" | "MENTOR" | "ADMIN";
      days[idx]![role] = row.count;
    }

    // -------- 2) Class averages: average % per course (mentor-scoped if mentor)
    const courseFilter = isAdmin ? {} : { mentor: uid };
    const courses = await Course.find(courseFilter)
      .select("_id title code")
      .lean();
    const courseIds = courses.map((c) => c._id);

    const assessAgg = await Assessment.aggregate<{
      _id: unknown;
      avgPct: number;
      count: number;
    }>([
      { $match: { course: { $in: courseIds } } },
      { $unwind: "$scores" },
      {
        $group: {
          _id: "$course",
          avgPct: {
            $avg: {
              $multiply: [
                { $divide: ["$scores.marks", "$totalMarks"] },
                100,
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const avgByCourse = new Map(
      assessAgg.map((r) => [String(r._id), { avgPct: r.avgPct, count: r.count }]),
    );
    const classAverages = courses
      .map((c) => {
        const a = avgByCourse.get(String(c._id));
        return {
          name: c.code,
          fullName: c.title,
          avg: a ? Number(a.avgPct.toFixed(1)) : 0,
          scoredCount: a?.count ?? 0,
        };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    // -------- 3) Intervention pipeline (status counts)
    const intMatch = isAdmin ? {} : { mentor: uid };
    const intRows = await Intervention.aggregate<{ _id: string; count: number }>([
      { $match: intMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const interventionPipeline = [
      { name: "Open", value: 0, color: "#ef4444" },
      { name: "In progress", value: 0, color: "#f59e0b" },
      { name: "Resolved", value: 0, color: "#10b981" },
    ];
    const map: Record<string, number> = { OPEN: 0, IN_PROGRESS: 1, RESOLVED: 2 };
    for (const r of intRows) {
      const idx = map[r._id];
      if (idx !== undefined) interventionPipeline[idx]!.value = r.count;
    }

    return ok({
      growth: days,
      classAverages,
      interventionPipeline,
    });
  } catch (err) {
    return handleError(err);
  }
}
