'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { KALSHI_CATEGORIES } from '@/lib/kalshi/types';
import { MarketCard } from '@/components/markets/market-card';
import { cn } from '@/lib/utils';

type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

export default function ForYouPage() {
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/kalshi/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riskTolerance,
          preferredCategories: selectedCategories,
          minProbability: 0,
          maxProbability: 100,
        }),
      });

      if (!response.ok) throw new Error('Failed to get recommendations');

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('Failed to get recommendations:', err);
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white">
                Kalshify
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/markets"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Markets
              </Link>
              <Link
                href="/portfolio"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Portfolio
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Leaderboard
              </Link>
              <Link
                href="/for-you"
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                For You
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Recommendations
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Markets For You
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Get personalized market recommendations based on your preferences
          </p>
        </div>

        {/* Preferences Form */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 mb-8">
          {/* Risk Tolerance */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Risk Tolerance
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['conservative', 'moderate', 'aggressive'] as RiskTolerance[]).map(
                (level) => (
                  <button
                    key={level}
                    onClick={() => setRiskTolerance(level)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all',
                      riskTolerance === level
                        ? 'bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    {level}
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {riskTolerance === 'conservative' &&
                'Prefer established markets with moderate probabilities'}
              {riskTolerance === 'moderate' &&
                'Balance between opportunity and risk'}
              {riskTolerance === 'aggressive' &&
                'Open to high-risk, high-reward opportunities'}
            </p>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Interests (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {KALSHI_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    selectedCategories.includes(category)
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Get Recommendations Button */}
          <button
            onClick={getRecommendations}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing markets...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Get Recommendations
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Your Recommended Markets
            </h2>

            {/* Summary */}
            {recommendations.preferenceSummary && (
              <p className="text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                {recommendations.preferenceSummary}
              </p>
            )}

            {/* Market Cards */}
            <div className="grid gap-4">
              {recommendations.recommendations?.map((rec: any, index: number) => (
                <div
                  key={rec.ticker || index}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        #{rec.rank || index + 1} Match
                      </span>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
                        {rec.ticker}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-zinc-500">Score</div>
                      <div className="text-lg font-bold text-zinc-900 dark:text-white">
                        {rec.matchScore || 0}
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-3">
                    {rec.reasoning}
                  </p>
                  {rec.highlights && rec.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rec.highlights.map((highlight: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-xs text-zinc-600 dark:text-zinc-400"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Category Insights */}
            {recommendations.categoryInsights &&
              recommendations.categoryInsights.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
                    Category Insights
                  </h3>
                  <div className="space-y-2">
                    {recommendations.categoryInsights.map(
                      (insight: any, i: number) => (
                        <div key={i}>
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {insight.category}:
                          </span>{' '}
                          <span className="text-zinc-600 dark:text-zinc-400">
                            {insight.outlook}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
}
