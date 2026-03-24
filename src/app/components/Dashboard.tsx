"use client";

import type { TradeAnalysis } from "@/app/api/analyze/route";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Clock,
  ChartLine,
  TrendDown,
} from "@phosphor-icons/react";

interface Props {
  data: TradeAnalysis;
  onReset: () => void;
}

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

const CHART_COLORS = [
  "#00d4ff",
  "#00ff9d",
  "#f59e0b",
  "#a78bfa",
  "#fb7185",
  "#34d399",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-neutral mb-1">{label}</p>
      {payload.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}:{" "}
            <span className="font-bold font-mono">
              {typeof entry.value === "number"
                ? (entry.value > 0 ? "+" : "") + entry.value.toFixed(2)
                : entry.value}
            </span>
          </p>
        ),
      )}
    </div>
  );
}

export default function Dashboard({ data, onReset }: Props) {
  const pnlPositive = data.totalPnL >= 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ChartLine size={20} className="text-accent" weight="duotone" />
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
        <button
          onClick={onReset}
          className="cursor-pointer self-start sm:self-auto px-5 py-2.5 rounded-xl border border-border text-sm text-neutral hover:border-accent/40 hover:text-foreground transition-all"
        >
          Novo relatório
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
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
          positive={data.winRate >= 50 ? true : false}
        />
        <StatCard
          label="Profit Factor"
          value={data.profitFactor.toFixed(2)}
          sub={data.profitFactor >= 1 ? "Positivo" : "Abaixo do ideal"}
          positive={data.profitFactor >= 1 ? true : false}
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

      {/* Equity Curve */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <ArrowUpRight size={18} className="text-accent" />
          <h3 className="font-semibold text-foreground">Curva de Capital</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={data.equityCurve}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2740" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="equity"
              name="Capital"
              stroke="#00d4ff"
              strokeWidth={2}
              fill="url(#equityGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#00d4ff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Asset performance + Win/Loss by type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Asset */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy size={18} className="text-accent-secondary" />
            <h3 className="font-semibold text-foreground">P&L por Ativo</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.byAsset}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2740" />
              <XAxis
                dataKey="asset"
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                {data.byAsset.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? "#00ff9d" : "#ff4d6d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Type pie */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <ArrowDownRight size={18} className="text-loss" weight="duotone" />
            <h3 className="font-semibold text-foreground">Compra vs Venda</h3>
          </div>
          <div className="flex items-center justify-center gap-8">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie
                  data={data.byType}
                  dataKey="trades"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {data.byType.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
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
                        <p
                          style={{ color: d.pnl >= 0 ? "#00ff9d" : "#ff4d6d" }}
                        >
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
              {data.byType.map((t, i) => (
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
      </div>

      {/* By Hour */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock size={18} className="text-accent" />
          <h3 className="font-semibold text-foreground">
            P&L por Horário de Abertura
          </h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data.byHour}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2740" />
            <XAxis
              dataKey="label"
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
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
              {data.byHour.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? "#00d4ff" : "#ff4d6d"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day of week + Monthly */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Day of week */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendDown size={18} className="text-accent-secondary" />
            <h3 className="font-semibold text-foreground">
              P&L por Dia da Semana
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart
              data={data.byDayOfWeek}
              cx="50%"
              cy="50%"
              outerRadius={70}
            >
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
            <ChartLine size={18} className="text-accent" />
            <h3 className="font-semibold text-foreground">P&L Mensal</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.monthlyPnL}
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pnl" name="P&L Mensal" radius={[4, 4, 0, 0]}>
                {data.monthlyPnL.map((entry, i) => (
                  <Cell key={i} fill={entry.pnl >= 0 ? "#00ff9d" : "#ff4d6d"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset detail cards */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy size={18} className="text-accent-secondary" />
          <h3 className="font-semibold text-foreground">Detalhes por Ativo</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {data.byAsset.map((a, i) => (
            <div
              key={i}
              className={[
                "flex flex-col gap-2 p-4 rounded-xl border",
                a.pnl >= 0
                  ? "bg-profit/5 border-profit/20"
                  : "bg-loss/5 border-loss/20",
              ].join(" ")}
            >
              <span className="text-sm font-bold text-foreground">
                {a.asset}
              </span>
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
    </div>
  );
}
