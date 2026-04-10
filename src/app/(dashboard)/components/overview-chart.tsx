"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface OverviewChartProps {
  data: {
    name: string;
    members: number;
    visitors: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const membersPayload = payload.find((p: any) => p.dataKey === 'members');
      const visitorsPayload = payload.find((p: any) => p.dataKey === 'visitors');
      
      return (
        <div className="rounded-lg border border-slate-200 bg-white/80 p-3 shadow-lg backdrop-blur-md">
          <p className="mb-2 font-medium text-slate-900">{label}</p>
          <div className="space-y-1">
            {membersPayload && (
              <p className="text-sm font-semibold text-blue-600">
                Membros: <span className="font-normal text-slate-600">{membersPayload.value}</span>
              </p>
            )}
            {visitorsPayload && (
              <p className="text-sm font-semibold text-orange-500">
                Visitantes: <span className="font-normal text-slate-600">{visitorsPayload.value}</span>
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
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: "#64748b" }} 
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="top" 
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingBottom: '16px' }}
        />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Visitantes"
          stroke="#f97316"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorVisitors)"
          isAnimationActive={true}
          animationDuration={1500}
        />
        <Area
          type="monotone"
          dataKey="members"
          name="Membros"
          stroke="#3b82f6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#colorMembers)"
          isAnimationActive={true}
          animationDuration={1500}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
