"use client";

import { useTradeAnalysis } from "@/hooks/useTradeAnalysis";
import { ChartLineIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import useAnalysisStore from "@/stores/useAnalysisStore";
import AnalyzingLoader from "./components/AnalyzingLoader";
import Dashboard from "./components/Dashboard";
import FileUpload from "./components/FileUpload";

export default function Home() {
  const { state, data, errorMessage, analyze, reset } = useTradeAnalysis();

  useEffect(() => {
    try {
      const store = useAnalysisStore.getState();
      // Already showing the dashboard — nothing to do.
      if (store.state === "done") return;

      // Zustand persist rehydrated the data but couldn't restore state
      // (e.g. first render before merge runs on older hydration paths).
      if (store.data) {
        useAnalysisStore.setState({ state: "done" });
        return;
      }

      // Fallback: migrate from legacy localStorage key.
      const rawLegacy = localStorage.getItem("trading_feedback.analysis");
      if (!rawLegacy) return;
      const legacy = JSON.parse(rawLegacy);
      const data = legacy?.data ?? legacy;
      if (data && (data.traderName || data.totalTrades !== undefined)) {
        useAnalysisStore.setState({ data, state: "done" });
        localStorage.removeItem("trading_feedback.analysis");
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Persistent top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <ChartLineIcon size={22} weight="duotone" className="text-accent" />
          <span className="font-semibold text-foreground tracking-tight">
            Trading<span className="text-accent">Feedback</span>
          </span>
          <span className="ml-auto text-xs text-neutral hidden sm:block font-mono">
            Análise de Performance Profissional
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {state === "idle" && (
          <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-10">
            <div className="text-center max-w-lg">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-12 bg-linear-to-r from-transparent to-accent/60" />
                <span className="text-xs font-mono text-accent/70 uppercase tracking-widest">
                  Upload &amp; Analyze
                </span>
                <span className="h-px w-12 bg-linear-to-l from-transparent to-accent/60" />
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground">
                Veja onde seu{" "}
                <span className="bg-linear-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                  edge está
                </span>
              </h1>
              <p className="mt-4 text-base text-neutral leading-relaxed">
                Envie seu histórico de operações em Excel e obtenha um dashboard
                completo com curva de capital, melhores ativos, horários e muito
                mais.
              </p>
            </div>

            <div className="w-full max-w-xl">
              <FileUpload onUpload={analyze} isLoading={false} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
              {[
                { icon: "📈", label: "Curva de Capital" },
                { icon: "🏆", label: "Melhor Ativo" },
                { icon: "⏰", label: "Melhor Horário" },
                { icon: "🎯", label: "Win Rate & PF" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border text-center"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-xs text-neutral font-medium">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {state === "loading" && (
          <section className="flex-1 flex flex-col items-center justify-center px-4 py-16">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Analisando seu relatório
              </h2>
              <p className="text-sm text-neutral mt-2">
                Isso leva apenas alguns segundos...
              </p>
            </div>
            <AnalyzingLoader />
          </section>
        )}

        {state === "error" && (
          <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 gap-6">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-loss/10 border border-loss/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Erro ao processar
              </h2>
              <p className="text-sm text-neutral mt-2">{errorMessage}</p>
            </div>
            <button
              onClick={reset}
              className="cursor-pointer px-6 py-3 rounded-xl bg-surface border border-border text-sm text-foreground hover:border-accent/40 transition-all"
            >
              Tentar novamente
            </button>
          </section>
        )}

        {state === "done" && data && (
          <section className="px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">
            <Dashboard data={data} onReset={reset} />
          </section>
        )}
      </div>
    </main>
  );
}
