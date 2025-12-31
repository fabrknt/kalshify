import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';
import { cn } from '@fabrknt/ui';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;        // % change from previous period
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const isPositive = change !== undefined && change >= 0;
  const showTrend = change !== undefined;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div className="p-2 bg-orange-50 rounded-lg">
            <Icon className="h-5 w-5 text-orange-600" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {/* Trend */}
      {showTrend && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUp className="h-4 w-4 text-green-600" />
          ) : (
            <ArrowDown className="h-4 w-4 text-red-600" />
          )}
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs yesterday</span>
        </div>
      )}
    </div>
  );
}
