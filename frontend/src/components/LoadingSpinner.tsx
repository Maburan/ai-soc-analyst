interface LoadingSpinnerProps {
  message?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  message = "Analyzing logs...",
  overlay = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-8 py-12 shadow-lg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
