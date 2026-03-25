"use client";

export const CHART_COLORS = [
  "#00d4ff",
  "#00ff9d",
  "#f59e0b",
  "#a78bfa",
  "#fb7185",
  "#34d399",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CustomTooltip({ active, payload, label }: any) {
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
