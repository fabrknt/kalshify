'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Twitter, Copy, Check, Flame, Trophy, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fireCelebration } from '@/components/ui/confetti';
import { CountUp } from '@/components/ui/animated-number';
import {
  getWinMessage,
  getCelebrationTitle,
  formatPnlWithFlair,
} from '@/lib/copy/microcopy';

export interface WinCelebrationData {
  id: string;
  marketTitle: string;
  pnlCents: number;
  pnlPercent: number;
  streak: number;
  position: 'yes' | 'no';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
}

interface WinCelebrationProps {
  data: WinCelebrationData | null;
  onClose: () => void;
  onShare?: (platform: 'twitter' | 'copy') => void;
}

export function WinCelebration({ data, onClose, onShare }: WinCelebrationProps) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (data && data.pnlCents > 0) {
      // Fire confetti
      fireCelebration();

      // Set playful messages
      setMessage(getWinMessage(data.pnlCents));
      setTitle(getCelebrationTitle(data.pnlCents, data.streak));

      // Auto-dismiss after 8 seconds
      const timeout = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timeout);
    }
  }, [data, onClose]);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/${data?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShare?.('copy');
  };

  const handleTwitterShare = () => {
    if (!data) return;

    const pnl = formatPnlWithFlair(data.pnlCents);
    const percent = data.pnlPercent > 0 ? `+${data.pnlPercent.toFixed(1)}%` : `${data.pnlPercent.toFixed(1)}%`;

    const text = `${pnl} (${percent}) on "${data.marketTitle}" 🎯\n\n${message}\n\nPaper trading on @Kalshify`;
    const url = `${window.location.origin}/share/${data.id}`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    onShare?.('twitter');
  };

  if (!data || data.pnlCents <= 0) return null;

  const isBigWin = data.pnlCents >= 5000;
  const isHotStreak = data.streak >= 3;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative w-full max-w-md rounded-2xl p-6 shadow-2xl',
            'bg-gradient-to-br',
            isBigWin
              ? 'from-yellow-500 via-orange-500 to-red-500'
              : 'from-green-500 via-emerald-500 to-teal-500',
            'text-white'
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4"
          >
            {isBigWin ? (
              <Trophy className="w-8 h-8" />
            ) : isHotStreak ? (
              <Flame className="w-8 h-8" />
            ) : (
              <TrendingUp className="w-8 h-8" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-center mb-2"
          >
            {title}
          </motion.h2>

          {/* Playful message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center text-white/90 mb-6"
          >
            {message}
          </motion.p>

          {/* P&L display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 rounded-xl p-4 mb-4"
          >
            <div className="text-center">
              <div className="text-4xl font-black mb-1">
                <CountUp
                  end={data.pnlCents / 100}
                  duration={1.5}
                  formatValue={(v) => `+$${v.toFixed(2)}`}
                />
              </div>
              <div className="text-lg font-semibold text-white/90">
                <CountUp
                  end={data.pnlPercent}
                  duration={1.5}
                  formatValue={(v) => `+${v.toFixed(1)}%`}
                />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20 text-sm text-white/80 text-center">
              <span className={cn(
                'inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mr-2',
                data.position === 'yes' ? 'bg-green-400/30' : 'bg-red-400/30'
              )}>
                {data.position}
              </span>
              {data.quantity} contracts @ {data.entryPrice}¢ → {data.exitPrice}¢
            </div>
          </motion.div>

          {/* Market title */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-white/80 mb-6 line-clamp-2"
          >
            {data.marketTitle}
          </motion.p>

          {/* Streak display */}
          {data.streak >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Flame className={cn(
                'w-5 h-5',
                data.streak >= 5 && 'text-yellow-300 animate-pulse'
              )} />
              <span className="font-bold">{data.streak} win streak!</span>
              <Flame className={cn(
                'w-5 h-5',
                data.streak >= 5 && 'text-yellow-300 animate-pulse'
              )} />
            </motion.div>
          )}

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3"
          >
            <button
              onClick={handleTwitterShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-white/90 transition-colors"
            >
              <Twitter className="w-5 h-5" />
              Share on X
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </motion.div>

          {/* Click to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-xs text-white/60 mt-4"
          >
            Click anywhere to dismiss
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
