import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[var(--muted)] text-[var(--foreground)]",
        primary:
          "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20",
        success:
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20",
        warning:
          "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/20",
        danger:
          "bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/20",
        outline: "border border-[var(--border)]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
