import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/guards";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, extra?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(extra ? { details: extra } : {}) },
    { status },
  );
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) return fail(err.message, err.status);
  if (err instanceof ZodError) {
    return fail("Validation failed", 422, err.flatten());
  }
  if (err instanceof Error) {
    if (err.message.includes("E11000")) {
      return fail("Duplicate value not allowed", 409);
    }
    return fail(err.message, 500);
  }
  return fail("Unknown server error", 500);
}
