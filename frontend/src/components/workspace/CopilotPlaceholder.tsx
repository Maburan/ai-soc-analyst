import { Bot, Sparkles, MessageSquare, FileText, Search, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const suggestions = [
  { icon: MessageSquare, label: "Explain this incident" },
  { icon: FileText, label: "Generate executive summary" },
  { icon: Search, label: "Suggest investigation steps" },
  { icon: ListChecks, label: "Extract indicators of compromise" },
];

export function CopilotPlaceholder() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium">AI Copilot</CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 uppercase font-semibold border-amber-500/20 bg-amber-500/10 text-amber-400"
          >
            Coming Soon
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center text-center gap-4 px-4 py-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
          <Sparkles className="h-6 w-6 text-primary/60" />
        </div>
        <div>
          <p className="text-sm font-medium">AI-Powered Analysis</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            Ask questions about this incident and get instant AI-driven insights.
          </p>
        </div>

        <div className="w-full space-y-1.5 mt-2">
          <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
            Suggested questions
          </p>
          {suggestions.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-left opacity-50"
            >
              <s.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-md bg-muted/30 px-3 py-2">
          <p className="text-[10px] text-muted-foreground/60">
            AI Copilot will be available in a future update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
