import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface ThreatScoreCardProps {
  score: number;
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-red-400 stroke-red-400";
  if (score >= 50) return "text-orange-400 stroke-orange-400";
  if (score >= 25) return "text-yellow-400 stroke-yellow-400";
  return "text-emerald-400 stroke-emerald-400";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Critical";
  if (score >= 50) return "High";
  if (score >= 25) return "Medium";
  return "Low";
}

export function ThreatScoreCard({ score, className }: ThreatScoreCardProps) {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);

  return (
    <Card className={cn("", className)}>
      <CardContent className="flex flex-col items-center justify-center gap-2 p-6">
        <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Threat Score
        </p>
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="drop-shadow-sm"
        >
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.15)"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className={cn("transition-all duration-1000 ease-out", color)}
          />
          <text
            x="70"
            y="62"
            textAnchor="middle"
            className="fill-foreground text-3xl font-bold"
          >
            {score}
          </text>
          <text
            x="70"
            y="84"
            textAnchor="middle"
            className={cn("fill-current text-[11px] font-semibold", color)}
          >
            {scoreLabel(score)}
          </text>
        </svg>
        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          Based on severity distribution, finding volume, and attack-type diversity across all analyses.
        </p>
      </CardContent>
    </Card>
  );
}
