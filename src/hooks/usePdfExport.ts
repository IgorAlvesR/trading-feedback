import type { TradeAnalysis } from "@/app/api/analyze/route";
import { useState } from "react";

export function usePdfExport(data: TradeAnalysis) {
  const [exporting, setExporting] = useState(false);

  async function exportPdf(element: HTMLElement) {
    if (exporting) return;
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0a0f1a",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;

      let finalWidth = pdfWidth;
      let finalHeight = pdfWidth / ratio;

      if (ratio < pdfWidth / pdfHeight) {
        finalHeight = pdfHeight;
        finalWidth = pdfHeight * ratio;
      }

      const totalPages = Math.ceil(finalHeight / pdfHeight);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          (pdfWidth - finalWidth) / 2,
          -page * pdfHeight,
          finalWidth,
          finalHeight,
        );
      }

      const filename =
        `analise-${data.traderName || "trader"}-${data.reportDate || "relatorio"}.pdf`
          .toLowerCase()
          .replace(/\s+/g, "-");
      pdf.save(filename);
    } finally {
      setExporting(false);
    }
  }

  return { exportPdf, exporting };
}
