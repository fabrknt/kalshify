import { Activity as ActivityIcon, Users, TrendingUp, Zap } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityChart } from '@/components/dashboard/activity-chart';
import { ActivityScoreGauge } from '@/components/dashboard/activity-score-gauge';
import { getMockMetrics, getComparisonMetrics } from '@/lib/mock-data';
import { formatNumber, formatDate } from '@/lib/utils/format';

export default function ActivityPage() {
  // Get 30 days of data
  const metrics = getMockMetrics(30);
  const { today, yesterday, changes } = getComparisonMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Metrics</h1>
        <p className="text-gray-600 mt-2">
          Detailed view of user activity and engagement over the last 30 days
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
          title="Activity Score"
          value={`${today.activityScore}/100`}
          change={changes.activityScore}
          icon={Zap}
        />
      </div>

      {/* Activity Score Gauge */}
      <ActivityScoreGauge score={today.activityScore} size="lg" />

      {/* Activity Chart */}
      <ActivityChart data={metrics} metrics={['dau', 'wau', 'mau']} height={400} />

      {/* Metrics Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Activity Metrics (Last 30 Days)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DAU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WAU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MAU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.slice(0, 10).map((metric) => (
                <tr key={metric.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(metric.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(metric.dau)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(metric.wau)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(metric.mau)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatNumber(metric.txCount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metric.activityScore >= 70
                          ? 'bg-green-100 text-green-800'
                          : metric.activityScore >= 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {metric.activityScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing 10 of {metrics.length} records
          </p>
        </div>
      </div>
    </div>
  );
}
