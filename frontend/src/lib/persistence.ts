import type { AnalysisHistoryItem } from "../types/api";

export const MAX_HISTORY_ITEMS = 20;

const STORAGE_KEY = "ai-soc-analysis-history";

export function loadAnalysisHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as AnalysisHistoryItem[];
  } catch {
    return [];
  }
}

export function saveAnalysisHistory(items: AnalysisHistoryItem[]): void {
  try {
    const sorted = [...items]
      .sort(
        (a, b) =>
          new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime(),
      )
      .slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
  } catch {
    /* storage full or unavailable — silently skip */
  }
}

export function findHistoryItem(
  id: string,
): AnalysisHistoryItem | undefined {
  const history = loadAnalysisHistory();
  return history.find((item) => item.id === id);
}
