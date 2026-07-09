import { useNavigate } from "react-router-dom";
import { Upload, BarChart3, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface QuickActionsProps {
  hasAnalysis: boolean;
}

export function QuickActions({ hasAnalysis }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5">
        <Button
          variant="default"
          size="default"
          className="w-full gap-2 whitespace-nowrap"
          onClick={() => navigate("/analyze")}
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span>New Analysis</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          className="w-full gap-2 whitespace-nowrap"
          disabled={!hasAnalysis}
          onClick={() => navigate("/workspace")}
        >
          <BarChart3 className="h-4 w-4 shrink-0" />
          <span>Investigation Workspace</span>
        </Button>

        <Button
          variant="outline"
          size="default"
          className="w-full gap-2 whitespace-nowrap"
          disabled
        >
          <Download className="h-4 w-4 shrink-0" />
          <span>Export Report</span>
        </Button>

        {!hasAnalysis && (
          <p className="pt-1 text-[10px] text-muted-foreground/50 text-center leading-relaxed">
            Workspace and Export become available after a log analysis.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
