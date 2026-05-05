"use client";

import { useState, useCallback } from "react";
import type { ZodSchema, ZodError } from "zod";

type FieldErrors = Record<string, string>;

/**
 * Tiny Zod-powered form-error helper.
 *
 * Usage:
 *   const { errors, validate, setServerError, clear, fieldProps } = useFormErrors(schema);
 *   const ok = validate(form); if (!ok) return;
 *   setServerError({ email: "Email already taken" });
 */
export function useFormErrors<T>(schema?: ZodSchema<T>) {
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = useCallback(
    (data: unknown): data is T => {
      if (!schema) return true;
      const r = schema.safeParse(data);
      if (r.success) {
        setErrors({});
        return true;
      }
      const flat = (r.error as ZodError).flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >;
      const next: FieldErrors = {};
      Object.entries(flat).forEach(([k, v]) => {
        if (v && v.length) next[k] = v[0]!;
      });
      setErrors(next);
      return false;
    },
    [schema],
  );

  const setServerError = useCallback((next: FieldErrors) => {
    setErrors((prev) => ({ ...prev, ...next }));
  }, []);

  const clearField = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const { [name]: _ignored, ...rest } = prev;
      void _ignored;
      return rest;
    });
  }, []);

  const clear = useCallback(() => setErrors({}), []);

  return { errors, validate, setServerError, clear, clearField };
}
