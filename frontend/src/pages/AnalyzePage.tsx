import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Shield,
  Terminal,
  X,
  File,
  AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAnalysis } from "../context/AnalysisContext";
import { useToast } from "../context/ToastContext";
import { useAnalysisHistory } from "../hooks/useAnalysisHistory";
import { analyzeLogFile } from "../services/api";

const SUPPORTED_EXTENSIONS = [".csv", ".log"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const FORMATS = [
  {
    title: "CSV Security Logs",
    description: "Structured CSV with timestamp, event type, user, and source IP columns.",
    extension: ".csv",
    icon: FileText,
  },
  {
    title: "Windows Security Logs",
    description: "Windows Event Viewer exports (.log) with Event IDs 4624, 4625, 4672.",
    extension: ".log",
    icon: Shield,
  },
  {
    title: "Linux Auth Logs",
    description: "/var/log/auth.log files with SSH authentication events.",
    extension: ".log",
    icon: Terminal,
  },
];

export function AnalyzePage() {
  const navigate = useNavigate();
  const { setAnalysisResult, setUploadedFileName } = useAnalysis();
  const { addEntry } = useAnalysisHistory();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function clearFile() {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      addEntry(selectedFile.name, result);
      showToast("success", "Analysis complete! View the results in the Investigation Workspace.");
      navigate("/workspace");
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
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analyze New Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload security log files for AI-powered threat detection and incident investigation.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {FORMATS.map((format) => (
          <Card
            key={format.title}
            className="transition-all duration-200 hover:border-border/80 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <format.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{format.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {format.description}
              </p>
              <p className="mt-3 text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">
                {format.extension}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card
          className={`relative transition-all duration-200 ${
            isDragOver
              ? "border-primary border-2 border-dashed bg-primary/5"
              : "border-dashed"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isLoading && (
            <LoadingSpinner message="Running SOC analysis workflow..." overlay />
          )}

          <CardContent className="p-8">
            {!selectedFile ? (
              <div
                className="flex cursor-pointer flex-col items-center gap-4 py-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-medium">
                    Drop your log file here, or{" "}
                    <span className="text-primary hover:underline">browse</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Supports .csv and .log files up to 10 MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.log,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <File className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Analyzing..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Analyze Logs
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={clearFile}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
