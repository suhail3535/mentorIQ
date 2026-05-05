"use client";

import useSWR from "swr";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { ChartCard } from "@/components/charts/chart-card";
import { apiFetch } from "@/lib/fetcher";

interface ChartData {
  growth: { date: string; STUDENT: number; MENTOR: number; ADMIN: number }[];
  classAverages: {
    name: string;
    fullName: string;
    avg: number;
    scoredCount: number;
  }[];
  interventionPipeline: { name: string; value: number; color: string }[];
}

const ROLE_COLORS = {
  STUDENT: "#10b981",
  MENTOR: "#6366f1",
  ADMIN: "#f59e0b",
};

function pctColor(pct: number): string {
  if (pct >= 75) return "#10b981";
  if (pct >= 50) return "#f59e0b";
  return "#ef4444";
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function DashboardCharts() {
  const { data, isLoading } = useSWR<ChartData>("/api/stats/charts", apiFetch);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Workspace growth */}
      <ChartCard
        className="lg:col-span-2"
        title="Workspace growth"
        subtitle="New users added per day, last 30 days"
        loading={isLoading}
        empty={
          !!data &&
          data.growth.every(
            (d) => d.STUDENT + d.MENTOR + d.ADMIN === 0,
          )
        }
        emptyHint="No new users in this window."
      >
        {data && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.growth}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                {(["STUDENT", "MENTOR", "ADMIN"] as const).map((r) => (
                  <linearGradient
                    id={`g-${r}`}
                    key={r}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={ROLE_COLORS[r]} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={ROLE_COLORS[r]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDay}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                allowDecimals={false}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelFormatter={(v) => formatDay(String(v))}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
              {(["STUDENT", "MENTOR", "ADMIN"] as const).map((r) => (
                <Area
                  key={r}
                  type="monotone"
                  dataKey={r}
                  stackId="1"
                  stroke={ROLE_COLORS[r]}
                  strokeWidth={2}
                  fill={`url(#g-${r})`}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Intervention pipeline */}
      <ChartCard
        title="Intervention pipeline"
        subtitle="Status breakdown across all interventions"
        loading={isLoading}
        empty={
          !!data &&
          data.interventionPipeline.every((p) => p.value === 0)
        }
        emptyHint="No interventions opened yet."
      >
        {data && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.interventionPipeline}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={86}
                paddingAngle={2}
                stroke="var(--card)"
                strokeWidth={2}
              >
                {data.interventionPipeline.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Class averages */}
      <ChartCard
        className="lg:col-span-3"
        title="Class averages"
        subtitle="Average score percentage per course (top 8)"
        loading={isLoading}
        empty={!!data && data.classAverages.length === 0}
        emptyHint="Add courses and record assessment scores to see this."
        height={Math.max(220, (data?.classAverages.length ?? 0) * 36 + 40)}
      >
        {data && data.classAverages.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.classAverages}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
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
              <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                {data.classAverages.map((c, i) => (
                  <Cell key={i} fill={pctColor(c.avg)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
