"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import { ListNumbersIcon } from "@phosphor-icons/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Props {
  data: TradeAnalysis["equityCurve"];
}

export function OperationsChart({ data }: Props) {
  const operationsData = data.map((point, i) => ({
    index: i + 1,
    label: `#${i + 1}`,
    pnl: point.pnl,
    asset: point.asset,
    type: point.type,
    date: point.date,
  }));

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <ListNumbersIcon size={18} className="text-accent" />
        <h3 className="font-semibold text-foreground">P&L por Operação</h3>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={operationsData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2740" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={Math.ceil(operationsData.length / 20)}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
                  <p className="font-bold text-foreground">
                    {d.label} — {d.asset}
                  </p>
                  <p className="text-neutral capitalize">
                    {d.type} · {d.date}
                  </p>
                  <p style={{ color: d.pnl >= 0 ? "#00ff9d" : "#ff4d6d" }}>
                    P&L:{" "}
                    <span className="font-bold font-mono">
                      {d.pnl >= 0 ? "+" : ""}${d.pnl.toFixed(2)}
                    </span>
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="pnl" name="P&L" radius={[3, 3, 0, 0]}>
            {operationsData.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? "#00ff9d" : "#ff4d6d"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
