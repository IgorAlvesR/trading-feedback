"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import { ChartLineIcon, TrendDownIcon } from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CustomTooltip } from "./shared";

interface Props {
  byDayOfWeek: TradeAnalysis["byDayOfWeek"];
  monthlyPnL: TradeAnalysis["monthlyPnL"];
}

export function WeeklyMonthlyCharts({ byDayOfWeek, monthlyPnL }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* By Day of Week */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendDownIcon size={18} className="text-accent-secondary" />
          <h3 className="font-semibold text-foreground">
            P&L por Dia da Semana
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={byDayOfWeek} cx="50%" cy="50%" outerRadius={70}>
            <PolarGrid stroke="#1a2740" />
            <PolarAngleAxis
              dataKey="day"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <Radar
              name="P&L"
              dataKey="pnl"
              stroke="#00d4ff"
              fill="#00d4ff"
              fillOpacity={0.2}
              dot={{ r: 3, fill: "#00d4ff" }}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <ChartLineIcon size={18} className="text-accent" />
          <h3 className="font-semibold text-foreground">P&L Mensal</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={monthlyPnL}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2740" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar dataKey="pnl" name="P&L Mensal" radius={[4, 4, 0, 0]}>
              {monthlyPnL.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? "#00ff9d" : "#ff4d6d"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
