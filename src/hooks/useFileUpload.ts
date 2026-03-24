import { useRef, useState, DragEvent } from "react";

const ACCEPTED_EXTENSIONS = /\.xlsx?$/i;

interface UseFileUploadReturn {
  inputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  isDragOver: boolean;
  openFilePicker: () => void;
  clearFile: () => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function validateAndSet(file: File) {
    if (!ACCEPTED_EXTENSIONS.test(file.name)) {
      alert("Por favor, envie um arquivo .xlsx ou .xls");
      return;
    }
    setSelectedFile(file);
  }

  function openFilePicker() {
    if (!selectedFile) inputRef.current?.click();
  }

  function clearFile() {
    setSelectedFile(null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSet(file);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
    e.target.value = "";
  }

  return {
    inputRef,
    selectedFile,
    isDragOver,
    openFilePicker,
    clearFile,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleInputChange,
  };
}
