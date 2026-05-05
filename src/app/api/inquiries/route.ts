import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Inquiry } from "@/models/Inquiry";
import { InquirySchemaZ } from "@/lib/validators";
import { ok, handleError } from "@/lib/api";
import { requireRole } from "@/lib/guards";

// Public endpoint for landing-page contact form
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = InquirySchemaZ.parse(body);
    await connectDB();
    const created = await Inquiry.create({
      ...data,
      source: "landing-page",
    });
    return ok({ id: created._id }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// Admin-only: list all inquiries
export async function GET(req: NextRequest) {
  try {
    await requireRole("ADMIN");
    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    const items = await Inquiry.find(filter).sort({ createdAt: -1 }).lean();
    return ok(items);
  } catch (err) {
    return handleError(err);
  }
}
