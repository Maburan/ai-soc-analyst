import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAnalysis } from "../context/AnalysisContext";
import { analyzeLogFile } from "../services/api";

const SUPPORTED_EXTENSIONS = [".csv", ".log"];

export function UploadLogsPage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setUploadedFileName } = useAnalysis();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a log file to analyze.");
      return;
    }

    const fileName = selectedFile.name.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
      setError("Only CSV (.csv) and Linux auth log (.log) files are supported.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeLogFile(selectedFile);
      setAnalysisResult(result);
      setUploadedFileName(selectedFile.name);
      navigate("/results");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to analyze the uploaded file.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Upload Logs</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Upload a CSV security log or Linux auth.log file to run automated
          correlation and incident investigation. The workflow will parse events,
          detect suspicious activity, and generate investigation reports.
        </p>
      </section>

      {isLoading ? (
        <LoadingSpinner message="Running SOC analysis workflow..." />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-dashed border-slate-300 bg-white p-8"
        >
          <label className="block text-sm font-medium text-slate-700">
            Log File (CSV or auth.log)
            <input
              type="file"
              accept=".csv,text/csv,.log,text/plain"
              onChange={handleFileChange}
              className="mt-3 block w-full cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
          </label>

          {selectedFile && (
            <p className="mt-3 text-sm text-slate-600">
              Selected file: <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!selectedFile}
          >
            Analyze Logs
          </button>
        </form>
      )}
    </div>
  );
}
