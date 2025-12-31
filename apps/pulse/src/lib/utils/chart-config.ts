import { formatNumber, formatDateShort } from './format';

/**
 * PULSE brand colors for charts (Purple theme)
 */
export const chartColors = {
  primary: '#667eea',      // Purple (PULSE brand)
  secondary: '#764ba2',    // Deep purple
  tertiary: '#48bb78',     // Green
  accent: '#ed8936',       // Orange

  // Chart-specific colors
  github: '#667eea',       // Purple
  discord: '#5865F2',      // Discord blue
  notion: '#000000',       // Black
  quality: '#48bb78',      // Green
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
 * Tooltip formatter for dates
 */
export const dateTooltipFormatter = (value: string): string => {
  return formatDateShort(value);
};

/**
 * Axis tick formatter for large numbers
 */
export const compactNumberFormatter = (value: number): string => {
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
};
