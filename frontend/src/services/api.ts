import type { AnalyzeResponse, ApiError } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TIMEOUT_MS = 120_000;

function formatErrorDetail(detail: ApiError["detail"]): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  return "Request failed.";
}

export async function analyzeLogFile(file: File): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json()) as ApiError;
      throw new Error(formatErrorDetail(errorBody.detail));
    }

    return (await response.json()) as AnalyzeResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        "The analysis timed out. Please try a smaller file or try again.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
