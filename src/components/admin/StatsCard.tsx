import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string; // tailwind text-*
  iconBg?: string; // tailwind bg-*
  isLoading?: boolean;
  onClick?: () => void;
  badge?: number | string;
  badgeColor?: string; // tailwind bg-*
  trend?: 'up' | 'down';
  trendLabel?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-primary-600',
  iconBg = 'bg-primary-50',
  isLoading = false,
  onClick,
  badge,
  badgeColor = 'bg-primary-500',
  trend,
  trendLabel,
}) => {
  const clickable = Boolean(onClick);
  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        clickable ? 'hover:shadow-lg' : '',
        isLoading ? 'opacity-60 pointer-events-none' : ''
      )}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate">{label}</CardTitle>
          {badge !== undefined && (
            <Badge className={cn('mt-1 text-xs', badgeColor)}>{badge}</Badge>
          )}
        </div>
        {trend && trendLabel && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trend === 'up' ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span>{trendLabel}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', isLoading && 'animate-pulse')}>{value}</div>
      </CardContent>
    </Card>
  );
};