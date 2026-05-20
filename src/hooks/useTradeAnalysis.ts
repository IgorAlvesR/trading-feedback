import type { TradeAnalysis } from "@/app/api/analyze/route";
import useAnalysisStore, { AnalysisStore } from "@/stores/useAnalysisStore";

type AnalysisState = "idle" | "loading" | "done" | "error";

interface UseTradeAnalysisReturn {
  state: AnalysisState;
  data: TradeAnalysis | null;
  errorMessage: string;
  analyze: (file: File) => Promise<void>;
  reset: () => void;
}

export function useTradeAnalysis(): UseTradeAnalysisReturn {
  const state = useAnalysisStore((s: AnalysisStore) => s.state);
  const data = useAnalysisStore((s: AnalysisStore) => s.data);
  const errorMessage = useAnalysisStore((s: AnalysisStore) => s.errorMessage);
  const analyze = useAnalysisStore((s: AnalysisStore) => s.analyze);
  const reset = useAnalysisStore((s: AnalysisStore) => s.reset);

  return { state, data, errorMessage, analyze, reset };
}
