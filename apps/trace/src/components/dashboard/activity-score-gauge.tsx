'use client';

import { cn } from '@fabrknt/ui';

export interface ActivityScoreGaugeProps {
  score: number;  // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ActivityScoreGauge({
  score,
  size = 'md',
  showLabel = true,
}: ActivityScoreGaugeProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));

  // Determine color based on score thresholds
  const getScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600';   // Green: 70-100
    if (score >= 40) return 'text-yellow-600';  // Yellow: 40-69
    return 'text-red-600';                      // Red: 0-39
  };

  const getRingColor = (score: number): string => {
    if (score >= 70) return 'stroke-green-600';
    if (score >= 40) return 'stroke-yellow-600';
    return 'stroke-red-600';
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      dimension: 120,
      strokeWidth: 8,
      textSize: 'text-3xl',
      labelSize: 'text-sm',
    },
    md: {
      dimension: 180,
      strokeWidth: 12,
      textSize: 'text-5xl',
      labelSize: 'text-base',
    },
    lg: {
      dimension: 240,
      strokeWidth: 16,
      textSize: 'text-6xl',
      labelSize: 'text-lg',
    },
  };

  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center">
      {showLabel && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Protocol Activity Score
        </h3>
      )}

      <div className="relative" style={{ width: config.dimension, height: config.dimension }}>
        {/* SVG Circle */}
        <svg
          className="transform -rotate-90"
          width={config.dimension}
          height={config.dimension}
        >
          {/* Background circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            className={cn(getRingColor(clampedScore), 'transition-all duration-1000 ease-out')}
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s ease-out',
            }}
          />
        </svg>

        {/* Score Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(config.textSize, 'font-bold', getScoreColor(clampedScore))}>
            {Math.round(clampedScore)}
          </span>
          <span className={cn(config.labelSize, 'text-gray-500 font-medium')}>
            out of 100
          </span>
        </div>
      </div>

      {/* Score Description */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {clampedScore >= 70 && 'Excellent activity! Your protocol is thriving.'}
          {clampedScore >= 40 && clampedScore < 70 && 'Good activity. Room for growth.'}
          {clampedScore < 40 && 'Low activity. Consider boosting engagement.'}
        </p>
      </div>
    </div>
  );
}
