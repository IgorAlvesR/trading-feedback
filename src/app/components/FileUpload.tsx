"use client";

import { ArrowUp, FileXls, X } from "@phosphor-icons/react";
import { useFileUpload } from "@/hooks/useFileUpload";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const {
    inputRef,
    selectedFile,
    isDragOver,
    openFilePicker,
    clearFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  } = useFileUpload();

  function handleSubmit() {
    if (selectedFile && !isLoading) onUpload(selectedFile);
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={[
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed",
          "p-12 cursor-pointer transition-all duration-300 select-none group",
          isDragOver
            ? "border-accent bg-accent/10 scale-[1.01]"
            : selectedFile
              ? "border-accent-secondary bg-accent-secondary/5"
              : "border-border bg-surface hover:border-accent/50 hover:bg-surface-2",
        ].join(" ")}
      >
        {/* Glow effect */}
        <div
          className={[
            "absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none",
            "bg-linear-to-br from-accent/5 to-accent-secondary/5",
            isDragOver || selectedFile
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-60",
          ].join(" ")}
        />

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleInputChange}
        />

        {selectedFile ? (
          <>
            <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-accent-secondary/10 border border-accent-secondary/30">
              <FileXls size={36} weight="duotone" className="text-accent-secondary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{selectedFile.name}</p>
              <p className="text-sm text-neutral mt-1">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-surface border border-border hover:border-loss/50 hover:text-loss transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <div
              className={[
                "flex items-center justify-center w-16 h-16 rounded-xl border transition-all duration-300",
                isDragOver
                  ? "bg-accent/20 border-accent"
                  : "bg-surface-2 border-border group-hover:border-accent/40 group-hover:bg-accent/5",
              ].join(" ")}
            >
              <ArrowUp
                size={32}
                weight="bold"
                className={
                  isDragOver
                    ? "text-accent"
                    : "text-neutral group-hover:text-accent/70 transition-colors"
                }
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {isDragOver ? "Solte o arquivo aqui" : "Envie seu relatório"}
              </p>
              <p className="text-sm text-neutral mt-1">
                Arraste e solte ou clique para selecionar
              </p>
              <p className="text-xs text-neutral/60 mt-1">.XLSX · .XLS</p>
            </div>
          </>
        )}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className={[
          "relative w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden",
          "cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
          selectedFile && !isLoading
            ? "bg-linear-to-r from-accent to-accent-secondary text-background hover:opacity-90 hover:scale-[1.01] shadow-lg shadow-accent/20"
            : "bg-surface border border-border text-neutral",
        ].join(" ")}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
            Processando...
          </span>
        ) : (
          "Analisar Relatório"
        )}
      </button>
    </div>
  );
}
