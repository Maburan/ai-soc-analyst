import type { AnalyzeResponse, ApiError } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ApiError;
    throw new Error(formatErrorDetail(errorBody.detail));
  }

  return (await response.json()) as AnalyzeResponse;
}
