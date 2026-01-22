import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clean up market titles from Kalshi API
// Removes "yes " or "no " prefix from sub-market titles like "yes Zach LaVine: 2+"
export function cleanMarketTitle(title: string): string {
  if (title.toLowerCase().startsWith('yes ')) {
    return title.slice(4);
  }
  if (title.toLowerCase().startsWith('no ')) {
    return title.slice(3);
  }
  return title;
}
