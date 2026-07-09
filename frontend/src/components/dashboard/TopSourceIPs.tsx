import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface TopSourceIPsProps {
  data: { ip: string; count: number }[];
  isLoading?: boolean;
}

export function TopSourceIPs({ data, isLoading }: TopSourceIPsProps) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Source IPs</CardTitle>
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
          <CardTitle className="text-sm font-medium">Top Source IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Top Source IPs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((item) => (
          <div key={item.ip} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-mono text-xs text-muted-foreground">{item.ip}</span>
              <span className="font-medium">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
