import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TrendingUp, Trophy, Flame, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';
import { cn } from '@/lib/utils';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

async function getShareData(id: string) {
  const position = await prisma.paperPosition.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          traderStats: true,
        },
      },
    },
  });

  if (!position || position.status !== 'closed') {
    return null;
  }

  const pnlCents = position.realizedPnl || 0;
  const pnlPercent = position.entryPrice > 0
    ? ((position.exitPrice! - position.entryPrice) / position.entryPrice) * 100
    : 0;

  // Get user's rank
  const allStats = await prisma.traderStats.findMany({
    orderBy: { totalPnl: 'desc' },
  });

  const rank = allStats.findIndex(s => s.userId === position.userId) + 1;

  return {
    id: position.id,
    marketTitle: position.marketTitle,
    position: position.position as 'yes' | 'no',
    quantity: position.quantity,
    entryPrice: position.entryPrice,
    exitPrice: position.exitPrice!,
    pnlCents,
    pnlPercent,
    displayName: position.user.traderStats?.displayName || position.user.displayName || 'Trader',
    rank: rank > 0 ? rank : null,
    streak: position.user.traderStats?.currentStreak || 0,
    closedAt: position.closedAt!,
  };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) {
    return {
      title: 'Trade Not Found | Kalshify',
    };
  }

  const pnlText = data.pnlCents > 0
    ? `+$${(data.pnlCents / 100).toFixed(2)}`
    : `-$${Math.abs(data.pnlCents / 100).toFixed(2)}`;
  const percentText = data.pnlPercent > 0
    ? `+${data.pnlPercent.toFixed(1)}%`
    : `${data.pnlPercent.toFixed(1)}%`;

  return {
    title: `${pnlText} (${percentText}) | ${data.displayName} on Kalshify`,
    description: `${data.displayName} made ${pnlText} on "${data.marketTitle}" • Paper trading on Kalshify`,
    openGraph: {
      title: `${pnlText} (${percentText}) on Kalshify`,
      description: `${data.displayName} made ${pnlText} on "${data.marketTitle}"`,
      type: 'website',
      siteName: 'Kalshify',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pnlText} (${percentText}) on Kalshify`,
      description: `${data.displayName} made ${pnlText} on "${data.marketTitle}"`,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const data = await getShareData(id);

  if (!data) {
    notFound();
  }

  const isWin = data.pnlCents > 0;
  const isBigWin = data.pnlCents >= 5000;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
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
            <Link
              href="/markets"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start Trading
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Share Card */}
          <div
            className={cn(
              'rounded-2xl p-6 shadow-xl mb-6',
              isWin
                ? isBigWin
                  ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500'
                : 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900',
              'text-white'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Kalshify</span>
              </div>
              <div className="text-sm text-white/70">
                {new Date(data.closedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>

            {/* P&L Display */}
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

            {/* Market Info */}
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
                  {data.quantity} contracts @ {data.entryPrice}¢ → {data.exitPrice}¢
                </span>
              </div>
              <p className="text-sm font-medium">{data.marketTitle}</p>
            </div>

            {/* User Info */}
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
              {data.streak >= 2 && (
                <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full">
                  <Flame className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-semibold">{data.streak}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 text-center">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
              Think you can beat this?
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Paper trade prediction markets on Kalshify. No real money, all the glory.
            </p>
            <Link
              href="/markets"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Start Paper Trading
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
