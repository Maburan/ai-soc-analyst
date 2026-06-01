import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AnalyzeResponse } from "../types/api";

interface AnalysisContextValue {
  analysisResult: AnalyzeResponse | null;
  setAnalysisResult: (result: AnalyzeResponse | null) => void;
  uploadedFileName: string | null;
  setUploadedFileName: (fileName: string | null) => void;
}

const AnalysisContext = createContext<AnalysisContextValue | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      analysisResult,
      setAnalysisResult,
      uploadedFileName,
      setUploadedFileName,
    }),
    [analysisResult, uploadedFileName],
  );

  return (
    <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);

  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }

  return context;
}
