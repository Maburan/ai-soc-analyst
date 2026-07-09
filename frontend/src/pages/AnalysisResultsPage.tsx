import { Navigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";

export function AnalysisResultsPage() {
  const { analysisResult } = useAnalysis();

  if (!analysisResult) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/workspace" replace />;
}
