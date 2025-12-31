import { format, parseISO, formatDistanceToNow } from 'date-fns';

/**
 * Format a number with thousand separators
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
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
 * Format relative time
 * @example formatRelativeTime('2024-01-15') => "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Truncate wallet address
 * @example truncateAddress('0x1234567890abcdef') => "0x1234...cdef"
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Abbreviate large numbers
 * @example abbreviateNumber(1234) => "1.2K"
 */
export function abbreviateNumber(num: number): string {
  const absNum = Math.abs(num);

  if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (absNum >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}
