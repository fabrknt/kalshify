'use client';

import { forwardRef } from 'react';
import { TrendingUp, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ShareCardData {
  marketTitle: string;
  position: 'yes' | 'no';
  pnlCents: number;
  pnlPercent: number;
  displayName: string;
  rank?: number;
  streak?: number;
  date: Date;
}

interface ShareCardProps {
  data: ShareCardData;
  className?: string;
}

/**
 * Shareable card component for social media
 * Can be exported as image using html2canvas
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, className }, ref) => {
    const isWin = data.pnlCents > 0;
    const isBigWin = data.pnlCents >= 5000;

    return (
      <div
        ref={ref}
        className={cn(
          'w-[400px] p-6 rounded-2xl shadow-xl',
          isWin
            ? isBigWin
              ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500'
              : 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500'
            : 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900',
          'text-white',
          className
        )}
      >
        {/* Header with branding */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Kalshify</span>
          </div>
          <div className="text-sm text-white/70">
            {data.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        {/* Main P&L display */}
        <div className="text-center mb-6">
          <div
            className={cn(
              'text-5xl font-black mb-2',
              !isWin && 'text-red-300'
            )}
          >
            {isWin ? '+' : '-'}$
            {Math.abs(data.pnlCents / 100).toFixed(2)}
          </div>
          <div className="text-xl font-semibold text-white/90">
            {isWin ? '+' : ''}
            {data.pnlPercent.toFixed(1)}%
          </div>
        </div>

        {/* Market info */}
        <div className="bg-white/15 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-bold uppercase',
                data.position === 'yes'
                  ? 'bg-green-400/30 text-green-100'
                  : 'bg-red-400/30 text-red-100'
              )}
            >
              {data.position}
            </span>
            <span className="text-sm text-white/70">
              {isWin ? 'Winning call' : 'Called it'}
            </span>
          </div>
          <p className="text-sm font-medium line-clamp-2">{data.marketTitle}</p>
        </div>

        {/* User info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">{data.displayName}</div>
              {data.rank && (
                <div className="text-sm text-white/70">Rank #{data.rank}</div>
              )}
            </div>
          </div>
          {data.streak && data.streak >= 2 && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full">
              <Flame className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">{data.streak}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/20 text-center">
          <p className="text-sm text-white/60">
            Paper trading on kalshify-fabrknt.vercel.app
          </p>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

interface ShareCardPreviewProps {
  data: ShareCardData;
  onDownload?: () => void;
}

/**
 * Preview wrapper for share card with download button
 */
export function ShareCardPreview({ data, onDownload }: ShareCardPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <ShareCard data={data} />
      {onDownload && (
        <button
          onClick={onDownload}
          className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Download Image
        </button>
      )}
    </div>
  );
}
