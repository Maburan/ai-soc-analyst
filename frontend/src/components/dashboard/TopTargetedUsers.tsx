import { User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface TopTargetedUsersProps {
  data: { user: string; count: number }[];
  isLoading?: boolean;
}

export function TopTargetedUsers({ data, isLoading }: TopTargetedUsersProps) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Most Targeted Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Most Targeted Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <User className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No user data available.</p>
            <p className="text-xs text-muted-foreground/60">
              Backend provides <code className="text-primary">affected_user</code> on each
              finding. If none appear, no users were targeted in analyzed logs.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Most Targeted Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.user} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate text-xs text-muted-foreground">
                {item.user}
              </span>
              <span className="font-medium tabular-nums">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-orange-500/70 transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
