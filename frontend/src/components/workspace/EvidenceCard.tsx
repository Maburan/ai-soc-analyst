import { Terminal, User, Globe } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface EvidenceCardProps {
  evidence: string[];
}

function parseEvidenceType(item: string): {
  type: "code" | "meta" | "finding";
  label?: string;
} {
  if (item.startsWith("Affected user:")) return { type: "meta", label: "User" };
  if (item.startsWith("Source IP:")) return { type: "meta", label: "Source IP" };
  if (item.startsWith("Finding severity:")) return { type: "meta", label: "Severity" };
  if (item.startsWith("Affected users:")) return { type: "meta", label: "Users" };
  if (item.startsWith("MITRE ATT&CK:")) return { type: "meta", label: "MITRE" };
  if (
    item.includes("failed login") ||
    item.includes("logged in") ||
    item.includes("accessed") ||
    item.includes("downloaded") ||
    item.includes("granted") ||
    item.includes("targeted")
  ) {
    return { type: "finding" };
  }
  return { type: "code" };
}

function highlightValues(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /('.*?'|".*?"|\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b|T\d{4}\.\d{3}|T\d{4})/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const val = match[0];
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-blue-500/10 px-1 py-0.5 font-mono text-[10px] text-blue-400"
        >
          {val}
        </code>,
      );
    } else if (/^T\d/.test(val)) {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-purple-500/10 px-1 py-0.5 font-mono text-[10px] text-purple-400"
        >
          {val}
        </code>,
      );
    } else {
      parts.push(
        <code
          key={match.index}
          className="rounded bg-amber-500/10 px-1 py-0.5 font-mono text-[10px] text-amber-400"
        >
          {val}
        </code>,
      );
    }
    lastIndex = match.index + val.length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

const metaIcons = {
  User: User,
  "Source IP": Globe,
  Severity: undefined,
  Users: User,
  MITRE: undefined,
};

export function EvidenceCard({ evidence }: EvidenceCardProps) {
  const metaItems = evidence.filter((e) => {
    const t = parseEvidenceType(e);
    return t.type === "meta";
  });
  const codeItems = evidence.filter((e) => {
    const t = parseEvidenceType(e);
    return t.type === "code" || t.type === "finding";
  });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {}
        {metaItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metaItems.map((item, i) => {
              const { label } = parseEvidenceType(item);
              const value = item.replace(/^(Affected user:|Source IP:|Finding severity:|Affected users:|MITRE ATT&CK:)\s*/, "");
              const Icon = label ? metaIcons[label as keyof typeof metaIcons] : undefined;
              return (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1.5"
                >
                  {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {label}:
                  </span>
                  <span className="text-[11px] font-medium text-foreground">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {}
        {codeItems.length > 0 && (
          <div className="rounded-md border border-border bg-muted/30">
            {codeItems.map((item, i) => {
              const highlighted = highlightValues(item);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 px-3 py-2 text-[11px] leading-relaxed",
                    i < codeItems.length - 1 && "border-b border-border",
                  )}
                >
                  <Terminal className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{highlighted}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
