import { useState, useCallback } from "react";
import type { AnalysisHistoryItem, AnalyzeResponse } from "../types/api";
import {
  loadAnalysisHistory,
  saveAnalysisHistory,
  findHistoryItem,
  MAX_HISTORY_ITEMS,
} from "../lib/persistence";

interface UseAnalysisHistoryReturn {
  history: AnalysisHistoryItem[];
  isLoading: boolean;
  addEntry: (filename: string, result: AnalyzeResponse) => void;
  getById: (id: string) => AnalysisHistoryItem | undefined;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
}

export function useAnalysisHistory(): UseAnalysisHistoryReturn {
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() =>
    loadAnalysisHistory(),
  );
  const [isLoading] = useState(false);

  const addEntry = useCallback(
    (filename: string, result: AnalyzeResponse) => {
      const item: AnalysisHistoryItem = {
        id: crypto.randomUUID(),
        filename,
        analyzedAt: new Date().toISOString(),
        analysisResult: result,
      };
      const prev = loadAnalysisHistory();
      const next = [item, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveAnalysisHistory(next);
      setHistory(next);
    },
    [],
  );

  const getById = useCallback((id: string) => {
    return findHistoryItem(id);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveAnalysisHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveAnalysisHistory([]);
  }, []);

  return {
    history,
    isLoading,
    addEntry,
    getById,
    removeEntry,
    clearHistory,
  };
}
