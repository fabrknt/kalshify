import { format, parseISO } from 'date-fns';

export function formatUSD(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const categoryLabels: Record<string, string> = {
  'defi-infra': 'INFRA',
};

export function formatCategory(category: string): string {
  const key = category.toLowerCase();
  if (categoryLabels[key]) {
    return categoryLabels[key];
  }
  return category.toUpperCase();
}

const subcategoryLabels: Record<string, string> = {
  'liquid-staking': 'LST',
  'derivatives': 'PERPS',
  'dev-tools': 'TOOLS',
};

export function formatSubcategory(subcategory: string): string {
  const key = subcategory.toLowerCase();
  if (subcategoryLabels[key]) {
    return subcategoryLabels[key];
  }
  return subcategory.replace(/-/g, ' ').toUpperCase();
}
