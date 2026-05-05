"use client";

import useSWR from "swr";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { apiFetch } from "@/lib/fetcher";

interface CourseChartData {
  classTrend: { name: string; fullName: string; date: string; avg: number }[];
  latestAssessmentTitle: string | null;
  latestDistribution: { name: string; fullName: string; pct: number }[];
}

function pctColor(pct: number): string {
  if (pct >= 75) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

export function CourseCharts({ courseId }: { courseId: string }) {
  const { data, isLoading } = useSWR<CourseChartData>(
    `/api/courses/${courseId}/charts`,
    apiFetch,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Class trend */}
      <ChartCard
        title="Class average trend"
        subtitle="Mean score % across each assessment, by date"
        loading={isLoading}
        empty={!!data && data.classTrend.length === 0}
        emptyHint="Add assessments with recorded scores to see the trend."
      >
        {data && data.classTrend.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.classTrend}
              margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}%`, "Avg"]}
                labelFormatter={(_l, payload) =>
                  payload?.[0]?.payload?.fullName ?? ""
                }
              />
              <ReferenceLine
                y={50}
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{
                  value: "Risk line",
                  position: "right",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="url(#trend-grad)"
                strokeWidth={3}
                dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
              <defs>
                <linearGradient id="trend-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#d946ef" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Latest assessment distribution */}
      <ChartCard
        title="Latest assessment distribution"
        subtitle={
          data?.latestAssessmentTitle
            ? `Per-student score on “${data.latestAssessmentTitle}”`
            : "Per-student score on the most recent assessment"
        }
        loading={isLoading}
        empty={!!data && data.latestDistribution.length === 0}
        emptyHint="Record scores on an assessment to see the breakdown."
      >
        {data && data.latestDistribution.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.latestDistribution}
              margin={{ top: 8, right: 16, left: -16, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(v, _n, p) => [
                  `${v}%`,
                  (p.payload as { fullName: string }).fullName,
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {data.latestDistribution.map((d, i) => (
                  <Cell key={i} fill={pctColor(d.pct)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
