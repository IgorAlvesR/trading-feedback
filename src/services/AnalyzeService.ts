import type { TradeAnalysis } from "@/app/api/analyze/route";

export class AnalyzeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = "AnalyzeServiceError";
  }
}

export class AnalyzeService {
  private static readonly endpoint = "/api/analyze";

  static async analyzeFile(file: File): Promise<TradeAnalysis> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(this.endpoint, {
      method: "POST",
      body: formData,
    });

    const json = await response.json();

    if (!response.ok) {
      throw new AnalyzeServiceError(
        json.error ?? "Erro desconhecido",
        response.status,
      );
    }

    return json as TradeAnalysis;
  }
}
