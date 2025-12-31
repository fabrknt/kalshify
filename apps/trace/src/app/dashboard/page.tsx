import { Users, TrendingUp, DollarSign, Activity as ActivityIcon } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { ActivityScoreGauge } from '@/components/dashboard/activity-score-gauge';
import { getMockMetrics, getComparisonMetrics } from '@/lib/mock-data';
import { formatNumber, formatUSD } from '@/lib/utils/format';

export default function DashboardPage() {
  // Get data
  const lastWeek = getMockMetrics(7);
  const { today, yesterday, changes } = getComparisonMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Track your protocol's activity metrics and engagement
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Daily Active Users"
          value={formatNumber(today.dau)}
          change={changes.dau}
          icon={Users}
        />
        <StatsCard
          title="Weekly Active Users"
          value={formatNumber(today.wau)}
          change={changes.wau}
          icon={TrendingUp}
        />
        <StatsCard
          title="Monthly Active Users"
          value={formatNumber(today.mau)}
          change={changes.mau}
          icon={ActivityIcon}
        />
        <StatsCard
          title="Transaction Volume"
          value={formatUSD(today.volumeUsd)}
          icon={DollarSign}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityChart data={lastWeek} metrics={['dau', 'wau', 'mau']} />
        </div>

        {/* Activity Score Gauge - Takes 1 column */}
        <div>
          <ActivityScoreGauge score={today.activityScore} size="md" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Transaction Count</p>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(today.txCount)}
            </p>
            <p className="text-sm text-muted-foreground/75 mt-1">transactions today</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Avg. Transaction Value</p>
            <p className="text-2xl font-bold text-foreground">
              {formatUSD(today.volumeUsd / today.txCount)}
            </p>
            <p className="text-sm text-muted-foreground/75 mt-1">per transaction</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Activity Score</p>
            <p className="text-2xl font-bold text-foreground">
              {today.activityScore}/100
            </p>
            <p className="text-sm text-muted-foreground/75 mt-1">protocol health</p>
          </div>
        </div>
      </div>
    </div>
  );
}
