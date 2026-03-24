"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { label: "Lendo arquivo Excel...", sub: "Extraindo dados das planilhas" },
  { label: "Identificando negociações...", sub: "Mapeando ativos e posições" },
  { label: "Calculando métricas...", sub: "Win rate, drawdown, profit factor" },
  { label: "Gerando curva de capital...", sub: "Construindo equity curve" },
  { label: "Analisando horários...", sub: "Identificando melhores janelas" },
  { label: "Finalizando dashboards...", sub: "Preparando visualizações" },
];

export default function AnalyzingLoader() {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = 900;
    const interval = setInterval(() => {
      setStepIdx((prev) => {
        if (prev < STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    const progInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2;
        return next >= 95 ? 95 : next;
      });
    }, 80);

    return () => {
      clearInterval(interval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-8">
      {/* Animated radar/pulse */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="absolute inset-0 rounded-full border border-accent/30 animate-ping"
            style={{
              animationDelay: `${i * 0.4}s`,
              animationDuration: "1.8s",
            }}
          />
        ))}
        <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/40">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-8 h-8 text-accent"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              d="M3 12h4l3-7 4 14 3-7h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full flex flex-col gap-3">
        {STEPS.map((step, i) => {
          const isDone = i < stepIdx;
          const isCurrent = i === stepIdx;
          return (
            <div
              key={i}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500",
                isCurrent
                  ? "bg-accent/10 border-accent/40 text-foreground"
                  : isDone
                    ? "bg-accent-secondary/5 border-accent-secondary/20 text-neutral"
                    : "border-border text-neutral/30",
              ].join(" ")}
            >
              <div
                className={[
                  "shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isCurrent
                    ? "bg-accent text-background animate-pulse"
                    : isDone
                      ? "bg-accent-secondary/50 text-background"
                      : "bg-surface border border-border",
                ].join(" ")}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    "text-sm font-medium truncate",
                    isCurrent
                      ? "text-foreground"
                      : isDone
                        ? "text-neutral"
                        : "text-neutral/30",
                  ].join(" ")}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-accent/70 mt-0.5 transition-all">
                    {step.sub}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-neutral mb-2">
          <span>Processando</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-linear-to-r from-accent to-accent-secondary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
