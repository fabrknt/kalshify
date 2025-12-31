import { formatNumber, formatUSD, formatDateShort } from './format';

/**
 * TRACE brand colors for charts
 */
export const chartColors = {
  primary: '#FF6B35',      // Orange (TRACE brand)
  secondary: '#4ECDC4',    // Teal
  tertiary: '#556270',     // Gray-blue
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Yellow
  danger: '#EF4444',       // Red

  // Chart-specific colors
  dau: '#FF6B35',          // Orange
  wau: '#4F46E5',          // Indigo
  mau: '#10B981',          // Green
  volume: '#8B5CF6',       // Purple
};

/**
 * Default chart theme configuration
 */
export const chartTheme = {
  grid: {
    stroke: '#E5E7EB',     // Gray-200
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: '#9CA3AF',     // Gray-400
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    labelStyle: {
      color: '#1F2937',      // Gray-800
      fontWeight: 600,
      marginBottom: '8px',
    },
    itemStyle: {
      color: '#6B7280',      // Gray-500
    },
  },
};

/**
 * Tooltip formatter for numbers
 */
export const numberTooltipFormatter = (value: number): string => {
  return formatNumber(value);
};

/**
 * Tooltip formatter for USD values
 */
export const usdTooltipFormatter = (value: number): string => {
  return formatUSD(value);
};

/**
 * Tooltip formatter for dates
 */
export const dateTooltipFormatter = (value: string): string => {
  return formatDateShort(value);
};

/**
 * Axis tick formatter for large numbers
 */
export const compactNumberFormatter = (value: number): string => {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
};

/**
 * Axis tick formatter for USD
 */
export const compactUSDFormatter = (value: number): string => {
  if (value >= 1_000_000) {
    return '$' + (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return '$' + (value / 1_000).toFixed(1) + 'K';
  }
  return '$' + value.toString();
};
