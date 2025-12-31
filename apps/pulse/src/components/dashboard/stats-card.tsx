import { LucideIcon } from 'lucide-react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div className="p-2 bg-purple-50 rounded-lg">
            <Icon className="h-5 w-5 text-purple-600" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}
