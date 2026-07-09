import { useNavigate } from "react-router-dom";
import { Upload, FileText, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";

interface QuickActionsProps {
  hasAnalysis: boolean;
}

export function QuickActions({ hasAnalysis }: QuickActionsProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="default"
          className="w-full justify-start gap-2"
          onClick={() => navigate("/analyze")}
        >
          <Upload className="h-4 w-4" />
          Analyze New Logs
        </Button>

        {hasAnalysis && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/workspace")}
          >
            <BarChart3 className="h-4 w-4" />
            View Investigation Workspace
          </Button>
        )}

        {hasAnalysis && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/analyze")}
          >
            <FileText className="h-4 w-4" />
            Analyze Another File
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
