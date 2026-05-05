import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border bg-[var(--card)] px-3.5 py-2 text-sm shadow-sm placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "border-red-500 focus-visible:ring-red-500"
          : "border-[var(--border)] focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
