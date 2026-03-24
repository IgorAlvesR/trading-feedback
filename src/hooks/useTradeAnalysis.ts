import { useState } from "react";
import type { TradeAnalysis } from "@/app/api/analyze/route";
import { AnalyzeService, AnalyzeServiceError } from "@/services/AnalyzeService";

type AnalysisState = "idle" | "loading" | "done" | "error";

interface UseTradeAnalysisReturn {
  state: AnalysisState;
  data: TradeAnalysis | null;
  errorMessage: string;
  analyze: (file: File) => Promise<void>;
  reset: () => void;
}

export function useTradeAnalysis(): UseTradeAnalysisReturn {
  const [state, setState] = useState<AnalysisState>("idle");
  const [data, setData] = useState<TradeAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function analyze(file: File) {
    setState("loading");
    setErrorMessage("");

    try {
      const result = await AnalyzeService.analyzeFile(file);
      setData(result);
      setState("done");
    } catch (err) {
      const message =
        err instanceof AnalyzeServiceError
          ? err.message
          : "Falha na comunicação com o servidor";
      setErrorMessage(message);
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setData(null);
    setErrorMessage("");
  }

  return { state, data, errorMessage, analyze, reset };
}
