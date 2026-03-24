import { NextRequest } from "next/server";
import * as XLSX from "xlsx";

// xlsx requires Node.js built-ins (Buffer, zlib) — force Node.js serverless
// runtime on Vercel instead of the Edge runtime.
export const runtime = "nodejs";

interface Trade {
  openTime: string;
  position: number;
  asset: string;
  type: "buy" | "sell";
  volume: number;
  openPrice: number;
  stopLoss: number | null;
  takeProfit: number | null;
  closeTime: string;
  closePrice: number;
  commission: number;
  swap: number;
  profit: number;
  durationMin: number;
}

interface AssetStats {
  asset: string;
  pnl: number;
  trades: number;
  wins: number;
  winRate: number;
}

interface HourStats {
  hour: number;
  label: string;
  pnl: number;
  trades: number;
  wins: number;
  winRate: number;
}

interface DayStats {
  day: string;
  pnl: number;
  trades: number;
  wins: number;
  winRate: number;
}

interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
  asset: string;
  type: string;
}

export interface TradeAnalysis {
  traderName: string;
  account: string;
  company: string;
  reportDate: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  avgDurationMin: number;
  bestAsset: string;
  bestHour: string;
  byAsset: AssetStats[];
  byHour: HourStats[];
  byDayOfWeek: DayStats[];
  byType: { type: string; pnl: number; trades: number; winRate: number }[];
  equityCurve: EquityPoint[];
  monthlyPnL: { month: string; pnl: number; trades: number }[];
}

// Matches timestamps like "2026.03.02 15:32:31"
function isTimestamp(val: unknown): val is string {
  return (
    typeof val === "string" &&
    /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}$/.test(val.trim())
  );
}

function parseRows(data: (string | number | null)[][]): Trade[] {
  // Find the "Posições" section label row, then the column-header row after it.
  // We ONLY read from "Posições" and stop as soon as the next section begins
  // (e.g. "Ordens", "Transações") so that columns from other sections (where
  // col 12 is the running balance, not profit) never corrupt our data.
  let positionsSectionIdx = -1;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && typeof row[0] === "string" && row[0].trim() === "Posições") {
      positionsSectionIdx = i;
      break;
    }
  }
  if (positionsSectionIdx === -1) return [];

  // The row right after "Posições" is the column header row — skip it too.
  const dataStartIdx = positionsSectionIdx + 2;

  const trades: Trade[] = [];

  for (let i = dataStartIdx; i < data.length; i++) {
    const row = data[i];
    // Stop as soon as we leave the Posições section: any row whose first cell
    // is NOT a datetime string signals a new section or summary area.
    if (!row || !isTimestamp(row[0])) break;

    const openTimeRaw = row[0];
    const position = row[1];
    const asset = row[2];
    const type = row[3];
    const volume = row[4];
    const openPrice = row[5];
    const stopLoss = row[6];
    const takeProfit = row[7];
    const closeTimeRaw = row[8];
    const closePrice = row[9];
    const commission = row[10];
    const swap = row[11];
    const profit = row[12];

    if (
      typeof asset !== "string" ||
      typeof type !== "string" ||
      typeof profit !== "number"
    ) {
      continue;
    }

    const openDate = new Date(
      openTimeRaw.replace(" ", "T").replace(/\./g, "-").slice(0, 19),
    );
    const closeDate = new Date(
      String(closeTimeRaw).replace(" ", "T").replace(/\./g, "-").slice(0, 19),
    );
    const durationMin =
      isNaN(openDate.getTime()) || isNaN(closeDate.getTime())
        ? 0
        : (closeDate.getTime() - openDate.getTime()) / 60000;

    trades.push({
      openTime: String(openTimeRaw),
      position: Number(position),
      asset: String(asset)
        .replace(".US", "")
        .replace(".DE", "")
        .replace(".EU", ""),
      type: String(type).toLowerCase() as "buy" | "sell",
      volume: Number(volume),
      openPrice: Number(openPrice),
      stopLoss:
        stopLoss !== null && stopLoss !== undefined ? Number(stopLoss) : null,
      takeProfit:
        takeProfit !== null && takeProfit !== undefined
          ? Number(takeProfit)
          : null,
      closeTime: String(closeTimeRaw),
      closePrice: Number(closePrice),
      commission: Number(commission) || 0,
      swap: Number(swap) || 0,
      profit: Number(profit),
      durationMin,
    });
  }

  return trades;
}

function buildAnalysis(
  trades: Trade[],
  meta: {
    traderName: string;
    account: string;
    company: string;
    reportDate: string;
  },
): TradeAnalysis {
  const wins = trades.filter((t) => t.profit > 0);
  const losses = trades.filter((t) => t.profit <= 0);

  const totalPnL = trades.reduce((s, t) => s + t.profit, 0);
  const grossProfit = wins.reduce((s, t) => s + t.profit, 0);
  const grossLoss = losses.reduce((s, t) => s + t.profit, 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const profitFactor =
    Math.abs(grossLoss) > 0 ? grossProfit / Math.abs(grossLoss) : 0;
  const bestTrade =
    trades.length > 0 ? Math.max(...trades.map((t) => t.profit)) : 0;
  const worstTrade =
    trades.length > 0 ? Math.min(...trades.map((t) => t.profit)) : 0;
  const avgDurationMin =
    trades.length > 0
      ? trades.reduce((s, t) => s + t.durationMin, 0) / trades.length
      : 0;

  // By asset
  const assetMap = new Map<
    string,
    { pnl: number; trades: number; wins: number }
  >();
  for (const t of trades) {
    const cur = assetMap.get(t.asset) ?? { pnl: 0, trades: 0, wins: 0 };
    cur.pnl += t.profit;
    cur.trades += 1;
    cur.wins += t.profit > 0 ? 1 : 0;
    assetMap.set(t.asset, cur);
  }
  const byAsset: AssetStats[] = Array.from(assetMap.entries())
    .map(([asset, v]) => ({
      asset,
      pnl: parseFloat(v.pnl.toFixed(2)),
      trades: v.trades,
      wins: v.wins,
      winRate: parseFloat(((v.wins / v.trades) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.pnl - a.pnl);

  const bestAsset = byAsset.length > 0 ? byAsset[0].asset : "-";

  // By hour of day (open time)
  const hourMap = new Map<
    number,
    { pnl: number; trades: number; wins: number }
  >();
  for (const t of trades) {
    const hour = parseInt(t.openTime.split(" ")[1]?.split(":")[0] ?? "0", 10);
    const cur = hourMap.get(hour) ?? { pnl: 0, trades: 0, wins: 0 };
    cur.pnl += t.profit;
    cur.trades += 1;
    cur.wins += t.profit > 0 ? 1 : 0;
    hourMap.set(hour, cur);
  }
  const byHour: HourStats[] = Array.from(hourMap.entries())
    .map(([hour, v]) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      pnl: parseFloat(v.pnl.toFixed(2)),
      trades: v.trades,
      wins: v.wins,
      winRate: parseFloat(((v.wins / v.trades) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.hour - b.hour);

  const bestHourEntry = byHour.reduce(
    (best, cur) => (cur.pnl > best.pnl ? cur : best),
    byHour[0] ?? {
      label: "-",
      pnl: 0,
      trades: 0,
      wins: 0,
      hour: 0,
      winRate: 0,
    },
  );
  const bestHour = bestHourEntry.label;

  // By day of week
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const dayMap = new Map<
    number,
    { pnl: number; trades: number; wins: number }
  >();
  for (const t of trades) {
    const parts = t.openTime.split(" ")[0].split(".");
    const d = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
    const day = d.getDay();
    const cur = dayMap.get(day) ?? { pnl: 0, trades: 0, wins: 0 };
    cur.pnl += t.profit;
    cur.trades += 1;
    cur.wins += t.profit > 0 ? 1 : 0;
    dayMap.set(day, cur);
  }
  const byDayOfWeek: DayStats[] = [1, 2, 3, 4, 5]
    .filter((d) => dayMap.has(d))
    .map((d) => {
      const v = dayMap.get(d)!;
      return {
        day: dayNames[d],
        pnl: parseFloat(v.pnl.toFixed(2)),
        trades: v.trades,
        wins: v.wins,
        winRate: parseFloat(((v.wins / v.trades) * 100).toFixed(1)),
      };
    });

  // By type (buy/sell)
  const typeMap = new Map<
    string,
    { pnl: number; trades: number; wins: number }
  >();
  for (const t of trades) {
    const cur = typeMap.get(t.type) ?? { pnl: 0, trades: 0, wins: 0 };
    cur.pnl += t.profit;
    cur.trades += 1;
    cur.wins += t.profit > 0 ? 1 : 0;
    typeMap.set(t.type, cur);
  }
  const byType = Array.from(typeMap.entries()).map(([type, v]) => ({
    type: type.toUpperCase(),
    pnl: parseFloat(v.pnl.toFixed(2)),
    trades: v.trades,
    winRate: parseFloat(((v.wins / v.trades) * 100).toFixed(1)),
  }));

  // Equity curve (sorted by close time)
  const sortedTrades = [...trades].sort((a, b) =>
    a.closeTime.localeCompare(b.closeTime),
  );
  let equity = 0;
  const equityCurve: EquityPoint[] = sortedTrades.map((t) => {
    equity += t.profit;
    return {
      date: t.closeTime.split(" ")[0].replace(/\./g, "/"),
      equity: parseFloat(equity.toFixed(2)),
      pnl: t.profit,
      asset: t.asset,
      type: t.type,
    };
  });

  // Monthly PnL
  const monthMap = new Map<string, { pnl: number; trades: number }>();
  for (const t of trades) {
    const parts = t.openTime.split(" ")[0].split(".");
    const month = `${parts[0]}/${parts[1]}`;
    const cur = monthMap.get(month) ?? { pnl: 0, trades: 0 };
    cur.pnl += t.profit;
    cur.trades += 1;
    monthMap.set(month, cur);
  }
  const monthlyPnL = Array.from(monthMap.entries())
    .map(([month, v]) => ({
      month,
      pnl: parseFloat(v.pnl.toFixed(2)),
      trades: v.trades,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    ...meta,
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: parseFloat(winRate.toFixed(1)),
    totalPnL: parseFloat(totalPnL.toFixed(2)),
    grossProfit: parseFloat(grossProfit.toFixed(2)),
    grossLoss: parseFloat(grossLoss.toFixed(2)),
    profitFactor: parseFloat(profitFactor.toFixed(3)),
    avgWin: parseFloat(avgWin.toFixed(2)),
    avgLoss: parseFloat(avgLoss.toFixed(2)),
    bestTrade: parseFloat(bestTrade.toFixed(2)),
    worstTrade: parseFloat(worstTrade.toFixed(2)),
    avgDurationMin: parseFloat(avgDurationMin.toFixed(1)),
    bestAsset,
    bestHour,
    byAsset,
    byHour,
    byDayOfWeek,
    byType,
    equityCurve,
    monthlyPnL,
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return Response.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
      return Response.json(
        { error: "Formato inválido. Envie um arquivo .xlsx ou .xls" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
      header: 1,
      defval: null,
    });

    // Extract metadata
    const metaRow1 = data[1] ?? [];
    const metaRow2 = data[2] ?? [];
    const metaRow3 = data[3] ?? [];
    const metaRow4 = data[4] ?? [];

    const traderName = String(metaRow1[3] ?? "").trim();
    const account = String(metaRow2[3] ?? "").trim();
    const company = String(metaRow3[3] ?? "").trim();
    const reportDate = String(metaRow4[3] ?? "").trim();

    const trades = parseRows(data);

    if (trades.length === 0) {
      return Response.json(
        { error: "Nenhuma negociação encontrada no arquivo" },
        { status: 422 },
      );
    }

    const analysis = buildAnalysis(trades, {
      traderName,
      account,
      company,
      reportDate,
    });

    return Response.json(analysis);
  } catch {
    return Response.json(
      { error: "Erro ao processar o arquivo. Verifique o formato." },
      { status: 500 },
    );
  }
}
