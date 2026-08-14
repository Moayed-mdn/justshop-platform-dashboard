import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  description?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  description,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 w-28 bg-muted animate-pulse rounded" />
          {Icon && (
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          <div className="h-3.5 w-36 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-muted-foreground';
    return trend === 'up' ? 'text-success' : 'text-destructive';
  };

  const TrendIcon = !trend || trend === 'neutral' 
    ? Minus 
    : trend === 'up' 
    ? ArrowUp 
    : ArrowDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-card-title">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-stat-value">{value}</div>
        {(change !== undefined || description) && (
          <div className="flex items-center gap-2 text-xs mt-1.5">
            {change !== undefined && (
              <span className={cn('inline-flex items-center gap-1 font-medium', getTrendColor())}>
                <TrendIcon className="h-3 w-3" />
                {Math.abs(change)}%
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
