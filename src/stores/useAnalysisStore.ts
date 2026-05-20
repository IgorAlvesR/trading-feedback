import create from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TradeAnalysis } from "@/app/api/analyze/route";
import { AnalyzeService, AnalyzeServiceError } from "@/services/AnalyzeService";

type AnalysisState = "idle" | "loading" | "done" | "error";

export interface AnalysisStore {
  state: AnalysisState;
  data: TradeAnalysis | null;
  errorMessage: string;
  analyze: (file: File) => Promise<void>;
  reset: () => void;
  setData: (d: TradeAnalysis | null) => void;
}

const STORAGE_KEY = "trading-feedback.analysis";

const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set) => ({
      state: "idle",
      data: null,
      errorMessage: "",
      analyze: async (file: File) => {
        if (!file) {
          set({ errorMessage: "Arquivo não enviado", state: "error" });
          return;
        }

        set({ state: "loading", errorMessage: "" });

        try {
          const result = await AnalyzeService.analyzeFile(file);
          set({ data: result, state: "done", errorMessage: "" });
          return;
        } catch (err) {
          const message =
            err instanceof AnalyzeServiceError
              ? err.message
              : "Falha na comunicação com o servidor";
          set({ errorMessage: message, state: "error" });
          return;
        }
      },
      reset: () => set({ state: "idle", data: null, errorMessage: "" }),
      setData: (d) => set({ data: d, state: d ? "done" : "idle" }),
    }),
    {
      name: STORAGE_KEY,
      // Use a lazy getter so localStorage is only accessed in the browser.
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (s) => ({ data: s.data }),
      // `merge` runs synchronously during rehydration (no TDZ risk) and
      // restores `state` to "done" whenever persisted data is found.
      merge: (persistedState, currentState) => {
        const data = (persistedState as Partial<AnalysisStore>)?.data;
        if (data) {
          return { ...currentState, data, state: "done" as AnalysisState };
        }
        return currentState;
      },
    },
  ),
);

export default useAnalysisStore;
