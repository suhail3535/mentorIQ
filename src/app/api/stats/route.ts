import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Assessment } from "@/models/Assessment";
import { Intervention } from "@/models/Intervention";
import { Inquiry } from "@/models/Inquiry";
import { ok, handleError } from "@/lib/api";
import { requireAuth } from "@/lib/guards";

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const role = session.user.role;
    const uid = session.user.id;

    if (role === "ADMIN") {
      const [
        students,
        mentors,
        courses,
        assessments,
        interventions,
        openInt,
        newInquiries,
      ] = await Promise.all([
        User.countDocuments({ role: "STUDENT" }),
        User.countDocuments({ role: "MENTOR" }),
        Course.countDocuments({}),
        Assessment.countDocuments({}),
        Intervention.countDocuments({}),
        Intervention.countDocuments({ status: { $ne: "RESOLVED" } }),
        Inquiry.countDocuments({ status: "NEW" }),
      ]);
      return ok({
        role,
        students,
        mentors,
        courses,
        assessments,
        interventions,
        openInterventions: openInt,
        newInquiries,
      });
    }

    if (role === "MENTOR") {
      const [courses, assessments, interventions, openInt] = await Promise.all([
        Course.countDocuments({ mentor: uid }),
        Assessment.countDocuments({ mentor: uid }),
        Intervention.countDocuments({ mentor: uid }),
        Intervention.countDocuments({ mentor: uid, status: { $ne: "RESOLVED" } }),
      ]);
      const myCourses = await Course.find({ mentor: uid }).select("students").lean();
      const studentSet = new Set<string>();
      myCourses.forEach((c) => c.students.forEach((s) => studentSet.add(String(s))));
      return ok({
        role,
        students: studentSet.size,
        courses,
        assessments,
        interventions,
        openInterventions: openInt,
      });
    }

    const [enrolled, assessments, interventions] = await Promise.all([
      Course.countDocuments({ students: uid }),
      Assessment.countDocuments({ "scores.student": uid }),
      Intervention.countDocuments({ student: uid }),
    ]);
    return ok({
      role,
      courses: enrolled,
      assessments,
      interventions,
    });
  } catch (err) {
    return handleError(err);
  }
}
