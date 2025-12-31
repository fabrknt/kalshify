import { format, parseISO } from 'date-fns';

/**
 * Format a number with thousand separators
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a number as USD currency
 * @example formatUSD(1234.56) => "$1,234.56"
 */
export function formatUSD(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a number as a percentage
 * @example formatPercent(12.5) => "+12.5%"
 * @example formatPercent(-5.2) => "-5.2%"
 */
export function formatPercent(num: number, decimals: number = 1): string {
  const sign = num >= 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Abbreviate large numbers
 * @example abbreviateNumber(1234) => "1.2K"
 * @example abbreviateNumber(1234567) => "1.2M"
 * @example abbreviateNumber(1234567890) => "1.2B"
 */
export function abbreviateNumber(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B';
  }
  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format a date string or Date object
 * @example formatDate('2024-01-15') => "Jan 15, 2024"
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format a date as short format
 * @example formatDateShort('2024-01-15') => "Jan 15"
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, 'MMM dd');
}

/**
 * Format a date as full format
 * @example formatDateFull('2024-01-15') => "Monday, January 15, 2024"
 */
export function formatDateFull(date: string | Date): string {
  return formatDate(date, 'EEEE, MMMM dd, yyyy');
}

/**
 * Compact currency format (abbreviates large amounts)
 * @example formatUSDCompact(1234567) => "$1.2M"
 */
export function formatUSDCompact(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000) {
    return '$' + (num / 1_000_000).toFixed(1) + 'M';
  }
  if (absNum >= 1_000) {
    return '$' + (num / 1_000).toFixed(1) + 'K';
  }
  return formatUSD(num);
}
