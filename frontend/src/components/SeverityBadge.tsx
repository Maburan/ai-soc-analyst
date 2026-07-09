import { cn } from "../lib/utils";

const severityStyles = {
  CRITICAL: {
    dot: "bg-red-500",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  HIGH: {
    dot: "bg-orange-500",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
  },
  MEDIUM: {
    bg: "bg-yellow-500/10",
    dot: "bg-yellow-500",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  LOW: {
    dot: "bg-green-500",
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
  },
} as const;

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const style = severityStyles[severity as keyof typeof severityStyles];
  if (!style) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
          className,
        )}
      >
        {severity}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        style.bg,
        style.text,
        style.border,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {severity}
    </span>
  );
}
