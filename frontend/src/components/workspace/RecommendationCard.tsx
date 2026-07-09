import { Shield, ShieldOff, KeyRound, Eye, Network, Lock, UserCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

interface RecommendationCardProps {
  recommendations: string[];
}

const recommendationMeta: Record<string, { icon: typeof Shield; priority: "high" | "medium" | "low" }> = {
  "Reset": { icon: KeyRound, priority: "high" },
  "Force logout": { icon: ShieldOff, priority: "high" },
  "Block": { icon: Shield, priority: "high" },
  "Rate": { icon: Network, priority: "medium" },
  "Review": { icon: Eye, priority: "medium" },
  "Enable": { icon: Lock, priority: "medium" },
  "Monitor": { icon: AlertTriangle, priority: "medium" },
  "Verify": { icon: UserCheck, priority: "medium" },
  "Confirm": { icon: UserCheck, priority: "medium" },
  "Identify": { icon: Eye, priority: "medium" },
  "Quarantine": { icon: ShieldOff, priority: "high" },
  "Inspect": { icon: Eye, priority: "medium" },
  "Notify": { icon: AlertTriangle, priority: "high" },
  "Preserve": { icon: Shield, priority: "medium" },
  "Enforce": { icon: Lock, priority: "high" },
  "Implement": { icon: Lock, priority: "medium" },
  "Temporarily": { icon: ShieldOff, priority: "medium" },
  "Audit": { icon: Eye, priority: "medium" },
};

function getRecommendationMeta(rec: string) {
  for (const [key, meta] of Object.entries(recommendationMeta)) {
    if (rec.startsWith(key)) return meta;
  }
  return { icon: Shield, priority: "medium" as const };
}

const priorityStyles = {
  high: {
    dot: "bg-red-500",
    badge: "border-red-500/20 bg-red-500/10 text-red-400",
    border: "border-red-500/10",
  },
  medium: {
    dot: "bg-orange-500",
    badge: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    border: "border-orange-500/10",
  },
  low: {
    dot: "bg-blue-500",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    border: "border-blue-500/10",
  },
};

export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  if (recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">No recommendations available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {recommendations.map((rec, i) => {
        const { icon: Icon, priority } = getRecommendationMeta(rec);
        const styles = priorityStyles[priority];
        return (
          <Card
            key={i}
            className={cn(
              "transition-all duration-200 hover:shadow-sm",
              priority === "high" && "border-red-500/10",
            )}
          >
            <CardContent className="flex items-start gap-3 p-3">
              <div
                className={cn(
                  "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
                  priority === "high" ? "bg-red-500/10 text-red-400" : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{rec}</p>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1.5 py-0 uppercase font-semibold border",
                      styles.badge,
                    )}
                  >
                    {priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
