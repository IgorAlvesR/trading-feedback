"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";

function StatCard({
  label,
  value,
  sub,
  positive,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2 p-5 rounded-2xl border transition-all",
        highlight
          ? "bg-linear-to-br from-accent/10 to-accent-secondary/5 border-accent/30"
          : "bg-surface border-border",
      ].join(" ")}
    >
      <p className="text-xs font-medium text-neutral uppercase tracking-widest">
        {label}
      </p>
      <p
        className={[
          "text-2xl font-bold font-mono",
          positive === true
            ? "text-profit"
            : positive === false
              ? "text-loss"
              : highlight
                ? "text-accent"
                : "text-foreground",
        ].join(" ")}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-neutral">{sub}</p>}
    </div>
  );
}

interface Props {
  data: TradeAnalysis;
}

export function KpiGrid({ data }: Props) {
  const pnlPositive = data.totalPnL >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Lucro líquido"
        value={`${pnlPositive ? "+" : ""}$${data.totalPnL.toFixed(2)}`}
        sub={`Bruto: +$${data.grossProfit.toFixed(2)} / -$${Math.abs(data.grossLoss).toFixed(2)}`}
        positive={pnlPositive}
        highlight
      />
      <StatCard
        label="Win Rate"
        value={`${data.winRate}%`}
        sub={`${data.winningTrades}W · ${data.losingTrades}L de ${data.totalTrades} trades`}
        positive={data.winRate >= 50}
      />
      <StatCard
        label="Profit Factor"
        value={data.profitFactor.toFixed(2)}
        sub={data.profitFactor >= 1 ? "Positivo" : "Abaixo do ideal"}
        positive={data.profitFactor >= 1}
      />
      <StatCard
        label="Melhor ativo"
        value={data.bestAsset}
        sub={`Melhor hora: ${data.bestHour}`}
        highlight
      />
      <StatCard
        label="Média por lucro"
        value={`+$${data.avgWin.toFixed(2)}`}
        positive={true}
      />
      <StatCard
        label="Média por perda"
        value={`-$${Math.abs(data.avgLoss).toFixed(2)}`}
        positive={false}
      />
      <StatCard
        label="Melhor trade"
        value={`+$${data.bestTrade.toFixed(2)}`}
        positive={true}
      />
      <StatCard
        label="Pior trade"
        value={`$${data.worstTrade.toFixed(2)}`}
        positive={false}
      />
    </div>
  );
}
