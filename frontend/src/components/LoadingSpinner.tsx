interface LoadingSpinnerProps {
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  message = "Analyzing logs...",
  overlay = false,
}: LoadingSpinnerProps) {
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white px-8 py-12 shadow-lg">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-medium text-slate-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-8 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
