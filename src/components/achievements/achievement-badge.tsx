'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Achievement,
  AchievementRarity,
  getRarityColor,
} from '@/lib/achievements/definitions';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: Date;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({
  achievement,
  isUnlocked,
  unlockedAt,
  size = 'md',
  showDescription = true,
  onClick,
}: AchievementBadgeProps) {
  const colors = getRarityColor(achievement.rarity);

  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer',
        isUnlocked
          ? 'bg-white dark:bg-zinc-800'
          : 'bg-zinc-100 dark:bg-zinc-900',
        onClick && 'hover:scale-105 transition-transform'
      )}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {/* Badge icon */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center',
          sizeClasses[size],
          isUnlocked ? colors.bg : 'bg-zinc-300 dark:bg-zinc-700',
          isUnlocked && colors.glow
        )}
      >
        {isUnlocked ? (
          <span>{achievement.icon}</span>
        ) : (
          <Lock className="w-1/2 h-1/2 text-zinc-500 dark:text-zinc-400" />
        )}
      </div>

      {/* Name and description */}
      <div className="text-center">
        <h4
          className={cn(
            'font-semibold text-sm',
            isUnlocked
              ? 'text-zinc-900 dark:text-white'
              : 'text-zinc-500 dark:text-zinc-400'
          )}
        >
          {achievement.name}
        </h4>

        {showDescription && (
          <p
            className={cn(
              'text-xs mt-0.5',
              isUnlocked
                ? 'text-zinc-600 dark:text-zinc-400'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {achievement.description}
          </p>
        )}

        {/* Rarity tag */}
        <span
          className={cn(
            'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
            isUnlocked
              ? `${colors.bg} ${colors.text}`
              : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'
          )}
        >
          {achievement.rarity}
        </span>

        {/* Unlock date */}
        {isUnlocked && unlockedAt && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            {unlockedAt.toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface AchievementGridProps {
  achievements: Achievement[];
  unlockedIds: string[];
  unlockedDates?: Record<string, Date>;
  columns?: 2 | 3 | 4;
}

export function AchievementGrid({
  achievements,
  unlockedIds,
  unlockedDates = {},
  columns = 3,
}: AchievementGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  // Sort: unlocked first, then by rarity
  const rarityOrder: Record<AchievementRarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3,
  };

  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);

    if (aUnlocked !== bUnlocked) {
      return aUnlocked ? -1 : 1;
    }

    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <div className={cn('grid gap-4', gridCols[columns])}>
      {sortedAchievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          isUnlocked={unlockedIds.includes(achievement.id)}
          unlockedAt={unlockedDates[achievement.id]}
          size="md"
        />
      ))}
    </div>
  );
}

interface AchievementProgressProps {
  unlockedCount: number;
  totalCount: number;
}

export function AchievementProgress({
  unlockedCount,
  totalCount,
}: AchievementProgressProps) {
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          Achievements Unlocked
        </span>
        <span className="font-semibold text-zinc-900 dark:text-white">
          {unlockedCount} / {totalCount}
        </span>
      </div>
      <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
