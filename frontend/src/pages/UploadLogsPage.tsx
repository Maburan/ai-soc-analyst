import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAnalysis } from "../context/AnalysisContext";
import { useToast } from "../context/ToastContext";
import { analyzeLogFile } from "../services/api";

const SUPPORTED_EXTENSIONS = [".csv", ".log"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const FORMATS = [
  {
    title: "CSV Security Logs",
    description:
      "Structured CSV files with timestamp, event type, source IP, user, and severity columns.",
    extension: ".csv",
    icon: (
      <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
      </svg>
    ),
  },
  {
    title: "Windows Security Logs",
    description:
      "Windows Event Viewer security logs (.log) with Event IDs, account SIDs, and authentication details.",
    extension: ".log",
    icon: (
      <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
  {
    title: "Linux Auth Logs",
    description:
      "Linux authentication logs (/var/log/auth.log) with SSH attempts, sudo usage, and user logins.",
    extension: ".log",
    icon: (
      <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
      </svg>
    ),
  },
];

export function UploadLogsPage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setUploadedFileName } = useAnalysis();
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);
  }

  function validateFile(file: File): string | null {
    const fileName = file.name.toLowerCase();
    const hasValidExtension = SUPPORTED_EXTENSIONS.some((ext) =>
      fileName.endsWith(ext),
    );
    if (!hasValidExtension) {
      return "Only CSV (.csv) and log (.log) files are supported.";
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File is too large. Maximum size is 10 MB.";
    }

    if (file.size === 0) {
      return "The selected file is empty. Please choose a file with data.";
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a log file to analyze.");
      return;
    }

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeLogFile(selectedFile);
      setAnalysisResult(result);
      setUploadedFileName(selectedFile.name);
      showToast("success", "Analysis complete! View the results below.");
      navigate("/results");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to analyze the uploaded file.";
      setError(message);
      showToast("error", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-slate-200 bg-white p-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-slate-500">
            AI-Powered Security Operations
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Security Log Investigator
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Upload your security logs and let AI analyze them for threats.
            The workflow parses events, correlates suspicious activity across
            multiple dimensions, and generates detailed investigation reports
            with evidence and remediation recommendations.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Supported Log Formats
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            The following log formats are currently supported for analysis.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {FORMATS.map((format) => (
            <div
              key={format.title}
              className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                {format.icon}
              </div>
              <h4 className="mt-4 font-semibold text-slate-900">
                {format.title}
              </h4>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {format.description}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-400">
                {format.extension.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Upload &amp; Analyze
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select a log file from your computer to begin the analysis.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative rounded-xl border border-dashed border-slate-300 bg-white p-8"
        >
          {isLoading && (
            <LoadingSpinner message="Running SOC analysis workflow..." overlay />
          )}

          <label className="block text-sm font-medium text-slate-700">
            Log File (CSV or .log)
            <input
              type="file"
              accept=".csv,.log,text/csv,text/plain"
              onChange={handleFileChange}
              className="mt-3 block w-full cursor-pointer rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            />
          </label>

          {selectedFile && !isLoading && (
            <div className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="font-medium text-slate-900">
                {selectedFile.name}
              </span>
              <span className="ml-2 text-slate-400">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? "Analyzing..." : "Analyze Logs"}
          </button>
        </form>
      </section>
    </div>
  );
}
