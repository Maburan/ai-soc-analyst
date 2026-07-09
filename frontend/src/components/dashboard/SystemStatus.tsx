import { useTheme } from "../../context/ThemeContext";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface StatusIndicatorProps {
  label: string;
  status: "online" | "offline" | "warning" | "active" | "idle";
  value?: string;
}

function StatusIndicator({ label, status, value }: StatusIndicatorProps) {
  const dotColors = {
    online: "bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]",
    offline: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]",
    warning: "bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]",
    active: "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]",
    idle: "bg-muted-foreground",
  };

  return (
    <div className="flex items-center gap-3">
      <span className={cn("h-2 w-2 rounded-full", dotColors[status])} />
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">
          {value ?? (status === "online" ? "Connected" : status === "offline" ? "Disconnected" : status === "active" ? "Active" : status === "warning" ? "Degraded" : "Idle")}
        </p>
      </div>
    </div>
  );
}

interface SystemStatusProps {
  hasAnalysis: boolean;
  detectionRuleCount: number;
}

export function SystemStatus({ hasAnalysis, detectionRuleCount }: SystemStatusProps) {
  const { theme } = useTheme();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatusIndicator
            label="Backend"
            status="online"
            value="Connected"
          />
          <StatusIndicator
            label="AI Engine"
            status={hasAnalysis ? "active" : "idle"}
            value={hasAnalysis ? "Available" : "Standby"}
          />
          <StatusIndicator
            label="Detection Rules"
            status={detectionRuleCount > 0 ? "active" : "idle"}
            value={`${detectionRuleCount} Active`}
          />
          <StatusIndicator
            label="Theme"
            status="idle"
            value={theme === "dark" ? "Dark Mode" : "Light Mode"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
