import { ArrowDown, ArrowUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: LucideIcon;
  trend?: 'up' | 'down';
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-gray-200"></div>
          <div className="mt-2 h-8 w-32 rounded bg-gray-200"></div>
          <div className="mt-2 h-3 w-16 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <div
            className="rounded-lg p-2"
            style={{
              background:
                'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
            }}
          >
            <Icon className="h-5 w-5" style={{ color: '#06b6d4' }} />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>

      {/* Change Indicator */}
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {trend === 'up' && <ArrowUp className="h-4 w-4" style={{ color: '#06b6d4' }} />}
          {trend === 'down' && <ArrowDown className="h-4 w-4 text-gray-500" />}
          <span
            className={cn(
              'text-sm font-medium',
              trend === 'down' ? 'text-gray-600' : trend === 'up' ? '' : 'text-muted-foreground'
            )}
            style={trend === 'up' ? { color: '#06b6d4' } : {}}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </span>
          <span className="text-sm text-muted-foreground/75">vs last month</span>
        </div>
      )}
    </div>
  );
}
