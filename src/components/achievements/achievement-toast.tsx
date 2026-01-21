'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Achievement, getRarityColor } from '@/lib/achievements/definitions';
import { fireConfetti } from '@/components/ui/confetti';

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  onShare?: (platform: 'twitter') => void;
}

export function AchievementToast({
  achievement,
  onClose,
  onShare,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);

      // Fire confetti for epic and legendary achievements
      if (achievement.rarity === 'epic' || achievement.rarity === 'legendary') {
        fireConfetti({
          particleCount: 150,
          spread: 100,
          colors: ['#a855f7', '#6366f1', '#ec4899', '#f59e0b'],
        });
      }

      // Auto-dismiss after 6 seconds
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 6000);

      return () => clearTimeout(timeout);
    }
  }, [achievement, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleShare = () => {
    if (!achievement) return;

    const text = `🏆 Achievement Unlocked: ${achievement.name}!\n\n${achievement.description}\n\n${achievement.message}\n\nPaper trading on @Kalshify`;
    const url = window.location.origin;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    onShare?.('twitter');
  };

  if (!achievement) return null;

  const colors = getRarityColor(achievement.rarity);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={cn(
            'fixed top-4 right-4 z-50 w-80 rounded-xl shadow-2xl overflow-hidden',
            colors.glow
          )}
        >
          {/* Gradient background */}
          <div className={cn('p-4', colors.bg)}>
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl"
              >
                {achievement.icon}
              </motion.div>
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-medium text-white/80 uppercase tracking-wide"
                >
                  Achievement Unlocked!
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-bold text-white"
                >
                  {achievement.name}
                </motion.h3>
              </div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-white/90 mb-2"
            >
              {achievement.description}
            </motion.p>

            {/* Celebratory message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm font-semibold text-white"
            >
              {achievement.message}
            </motion.p>

            {/* Rarity badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 flex items-center justify-between"
            >
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-white capitalize">
                {achievement.rarity}
              </span>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium text-white transition-colors"
              >
                <Twitter className="w-3.5 h-3.5" />
                Share
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AchievementQueueProps {
  achievements: Achievement[];
  onClear: () => void;
}

/**
 * Component to manage a queue of achievement toasts
 * Shows achievements one at a time
 */
export function AchievementQueue({ achievements, onClear }: AchievementQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClose = () => {
    if (currentIndex < achievements.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClear();
    }
  };

  const currentAchievement = achievements[currentIndex] || null;

  return <AchievementToast achievement={currentAchievement} onClose={handleClose} />;
}
