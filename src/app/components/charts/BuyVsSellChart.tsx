"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import { ArrowDownRightIcon } from "@phosphor-icons/react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "./shared";

interface Props {
  data: TradeAnalysis["byType"];
}

export function BuyVsSellChart({ data }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <ArrowDownRightIcon size={18} className="text-loss" weight="duotone" />
        <h3 className="font-semibold text-foreground">Compra vs Venda</h3>
      </div>
      <div className="flex items-center justify-center gap-8">
        <ResponsiveContainer width="60%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="trades"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
                    <p className="font-bold text-foreground">{d.type}</p>
                    <p className="text-neutral">Trades: {d.trades}</p>
                    <p className="text-neutral">Win Rate: {d.winRate}%</p>
                    <p style={{ color: d.pnl >= 0 ? "#00ff9d" : "#ff4d6d" }}>
                      P&L: ${d.pnl.toFixed(2)}
                    </p>
                  </div>
                );
              }}
            />
            <Legend
              formatter={(v) => (
                <span className="text-xs text-neutral">{v}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-4">
          {data.map((t, i) => (
            <div key={i} className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: CHART_COLORS[i] }}
                />
                <span className="text-xs font-semibold text-foreground">
                  {t.type}
                </span>
              </div>
              <span className="text-xs text-neutral ml-4">
                {t.trades} trades
              </span>
              <span
                className={[
                  "text-xs font-mono ml-4",
                  t.pnl >= 0 ? "text-profit" : "text-loss",
                ].join(" ")}
              >
                {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
