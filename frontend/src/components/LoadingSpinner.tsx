interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = "Analyzing logs..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-8 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
