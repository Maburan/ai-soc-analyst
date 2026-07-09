import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconClassName?: string;
  description?: string;
}

export function StatCard({ title, value, icon: Icon, iconClassName, description }: StatCardProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:border-border/80">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
              iconClassName,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
