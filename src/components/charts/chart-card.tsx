"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  height = 260,
  loading,
  empty,
  emptyHint,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  height?: number;
  loading?: boolean;
  empty?: boolean;
  emptyHint?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{title}</h3>
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                {subtitle}
              </p>
            )}
          </div>
          {action}
        </div>

        <div style={{ height }} className="relative w-full">
          {loading && <ChartSkeleton />}
          {!loading && empty && (
            <div className="grid h-full place-items-center text-center">
              <div className="space-y-1">
                <div className="text-sm font-medium text-[var(--muted-foreground)]">
                  No data yet
                </div>
                {emptyHint && (
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {emptyHint}
                  </div>
                )}
              </div>
            </div>
          )}
          {!loading && !empty && children}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="grid h-full place-items-center">
      <div className="flex w-full items-end justify-around gap-2 px-4">
        {[40, 70, 55, 85, 60, 75, 50].map((h, i) => (
          <div
            key={i}
            className="w-6 animate-pulse rounded-t-md bg-[var(--muted)]"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
