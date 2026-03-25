"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import { TrophyIcon } from "@phosphor-icons/react";

interface Props {
  data: TradeAnalysis["byAsset"];
}

export function AssetDetailCards({ data }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrophyIcon size={18} className="text-accent-secondary" />
        <h3 className="font-semibold text-foreground">Detalhes por Ativo</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {data.map((a, i) => (
          <div
            key={i}
            className={[
              "flex flex-col gap-2 p-4 rounded-xl border",
              a.pnl >= 0
                ? "bg-profit/5 border-profit/20"
                : "bg-loss/5 border-loss/20",
            ].join(" ")}
          >
            <span className="text-sm font-bold text-foreground">{a.asset}</span>
            <span
              className={[
                "text-lg font-mono font-bold",
                a.pnl >= 0 ? "text-profit" : "text-loss",
              ].join(" ")}
            >
              {a.pnl >= 0 ? "+" : ""}${a.pnl.toFixed(2)}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-neutral">{a.trades} trades</span>
              <span className="text-xs text-neutral">WR: {a.winRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
