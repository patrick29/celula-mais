"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface OverviewChartProps {
  data: {
    name: string;
    members: number;
    visitors: number;
  }[];
}

const VINE = "#2d4a2b";
const GOLD = "#d4a43c";
const GRID = "#ebe3cf";
const AXIS = "#7a726a";

export function OverviewChart({ data }: OverviewChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const membersPayload = payload.find((p: any) => p.dataKey === "members");
      const visitorsPayload = payload.find(
        (p: any) => p.dataKey === "visitors"
      );

      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-md">
          <p className="mb-2 text-sm font-medium text-foreground font-serif">
            {label}
          </p>
          <div className="space-y-1">
            {membersPayload && (
              <p className="text-sm">
                <span className="font-medium" style={{ color: VINE }}>
                  Membros:
                </span>{" "}
                <span className="text-muted-foreground">
                  {membersPayload.value}
                </span>
              </p>
            )}
            {visitorsPayload && (
              <p className="text-sm">
                <span className="font-medium" style={{ color: GOLD }}>
                  Visitantes:
                </span>{" "}
                <span className="text-muted-foreground">
                  {visitorsPayload.value}
                </span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={VINE} stopOpacity={0.32} />
            <stop offset="95%" stopColor={VINE} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={GOLD} stopOpacity={0.32} />
            <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: AXIS }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: AXIS }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{
            fontSize: "12px",
            fontWeight: 500,
            paddingBottom: "16px",
            color: AXIS,
          }}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Visitantes"
          stroke={GOLD}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVisitors)"
          isAnimationActive={true}
          animationDuration={1200}
        />
        <Area
          type="monotone"
          dataKey="members"
          name="Membros"
          stroke={VINE}
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorMembers)"
          isAnimationActive={true}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
