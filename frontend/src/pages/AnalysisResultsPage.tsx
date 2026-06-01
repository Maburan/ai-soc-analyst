import { Link, Navigate } from "react-router-dom";
import { FindingsTable } from "../components/FindingsTable";
import { ReportCards } from "../components/ReportCard";
import { useAnalysis } from "../context/AnalysisContext";

export function AnalysisResultsPage() {
  const { analysisResult, uploadedFileName } = useAnalysis();

  if (!analysisResult) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Analysis Results</h2>
            <p className="mt-2 text-sm text-slate-600">
              Results for{" "}
              <span className="font-medium text-slate-900">
                {uploadedFileName ?? "uploaded log file"}
              </span>
            </p>
          </div>

          <Link
            to="/"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Analyze Another File
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ResultStat label="Findings" value={analysisResult.findings.length} />
          <ResultStat
            label="Investigation Reports"
            value={analysisResult.investigation_reports.length}
          />
        </div>
      </section>

      <FindingsTable findings={analysisResult.findings} />
      <ReportCards reports={analysisResult.investigation_reports} />
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
