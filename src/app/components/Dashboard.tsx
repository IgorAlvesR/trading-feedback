"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import { ChartLineIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { useRef } from "react";
import { AssetDetailCards } from "./AssetDetailCards";
import { AssetBarChart } from "./charts/AssetBarChart";
import { BuyVsSellChart } from "./charts/BuyVsSellChart";
import { EquityCurveChart } from "./charts/EquityCurveChart";
import { HourlyChart } from "./charts/HourlyChart";
import { OperationsChart } from "./charts/OperationsChart";
import { WeeklyMonthlyCharts } from "./charts/WeeklyMonthlyCharts";
import { KpiGrid } from "./KpiGrid";
import { usePdfExport } from "@/hooks/usePdfExport";

interface Props {
  data: TradeAnalysis;
  onReset: () => void;
}

export default function Dashboard({ data, onReset }: Props) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { exportPdf, exporting } = usePdfExport(data);

  function handleDownloadPdf() {
    if (dashboardRef.current) exportPdf(dashboardRef.current);
  }

  return (
    <div
      ref={dashboardRef}
      className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ChartLineIcon size={20} className="text-accent" weight="duotone" />
            <span className="text-xs font-medium text-accent uppercase tracking-widest">
              Análise de Performance
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {data.traderName || "Trader"}
          </h2>
          <p className="text-sm text-neutral mt-0.5">
            {data.account} · {data.company}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleDownloadPdf}
            disabled={exporting}
            className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent/40 text-sm text-accent hover:bg-accent/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DownloadSimpleIcon size={16} weight="bold" />
            {exporting ? "Gerando PDF..." : "Baixar PDF"}
          </button>
          <button
            onClick={onReset}
            className="cursor-pointer px-5 py-2.5 rounded-xl border border-border text-sm text-neutral hover:border-accent/40 hover:text-foreground transition-all"
          >
            Novo relatório
          </button>
        </div>
      </div>

      <KpiGrid data={data} />

      <EquityCurveChart data={data.equityCurve} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AssetBarChart data={data.byAsset} />
        <BuyVsSellChart data={data.byType} />
      </div>

      <HourlyChart data={data.byHour} />

      <WeeklyMonthlyCharts
        byDayOfWeek={data.byDayOfWeek}
        monthlyPnL={data.monthlyPnL}
      />

      <OperationsChart data={data.equityCurve} />

      <AssetDetailCards data={data.byAsset} />
    </div>
  );
}
