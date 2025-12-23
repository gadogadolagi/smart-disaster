import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'danger' | 'warning' | 'success' | 'info';
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    danger: 'bg-danger/10 text-danger',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
    info: 'bg-info/10 text-info',
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('rounded-lg p-2', variantStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs mt-1',
              trend.isPositive ? 'text-success' : 'text-danger'
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% dari kemarin
          </p>
        )}
      </CardContent>
    </Card>
  );
}
