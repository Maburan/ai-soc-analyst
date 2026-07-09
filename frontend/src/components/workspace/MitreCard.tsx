import { Crosshair, ExternalLink } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { getMitreTechnique } from "./mitreData";
import type { SecurityFinding } from "../../types/api";

interface MitreCardProps {
  finding: SecurityFinding;
}

export function MitreCard({ finding }: MitreCardProps) {
  const technique = getMitreTechnique(finding.finding_type);

  if (!technique) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <Crosshair className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium">MITRE ATT&CK</p>
              <p className="text-[11px] text-muted-foreground">
                Mapping not available for this finding type.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group transition-all duration-200 hover:border-border/80">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Crosshair className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-medium">MITRE ATT&CK</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {technique.id}
              </p>
            </div>
          </div>
          <a
            href={`https://attack.mitre.org/techniques/${technique.id.replace(".", "/")}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            View
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-3 space-y-2">
          <div>
            <p className="text-[11px] font-medium">{technique.name}</p>
            <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
              {technique.category}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {technique.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
