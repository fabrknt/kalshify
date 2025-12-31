import Link from 'next/link';
import { ArrowLeft, Edit, Pause, Play, Trash2, ExternalLink, Copy } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Button } from '@fabrknt/ui';
import { StatsCard } from '@/components/dashboard/stats-card';
import { getCampaignById, calculateCampaignMetrics } from '@/lib/mock-campaigns';
import { formatNumber, formatUSD, formatDate, formatPercent } from '@/lib/utils/format';
import { cn } from '@fabrknt/ui';

const chainColors = {
  ethereum: 'bg-blue-100 text-blue-700',
  base: 'bg-indigo-100 text-indigo-700',
  polygon: 'bg-purple-100 text-purple-700',
  solana: 'bg-green-100 text-green-700',
};

const statusColors = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-muted text-foreground/90',
};

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const campaign = getCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  const metrics = calculateCampaignMetrics(campaign);
  const trackingUrl = `https://tr.fabrknt.com/${campaign.id}`;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/campaigns"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Campaigns
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              chainColors[campaign.chain]
            )}>
              {campaign.chain}
            </span>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              statusColors[campaign.status]
            )}>
              {campaign.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {campaign.status === 'active' ? (
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tracking Link */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">
          Campaign Tracking Link
        </h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-card px-3 py-2 rounded border border-orange-200 text-sm font-mono">
            {trackingUrl}
          </code>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-orange-700 mt-2">
          Use this link in your marketing materials to track clicks and conversions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Clicks"
          value={formatNumber(campaign.clicks)}
        />
        <StatsCard
          title="Conversions"
          value={formatNumber(campaign.conversions)}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${campaign.conversionRate}%`}
        />
        <StatsCard
          title="Cost Per Conversion"
          value={formatUSD(campaign.costPerConversion)}
        />
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget & Spend */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Budget & Spend
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="text-lg font-semibold text-foreground">
                {formatUSD(campaign.budgetUsd)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Spent</span>
              <span className="text-lg font-semibold text-orange-600">
                {formatUSD(campaign.spend)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className="text-lg font-semibold text-green-600">
                {formatUSD(metrics.remaining)}
              </span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-foreground">
                  {metrics.progress.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn(
                    'h-3 rounded-full transition-all',
                    metrics.progress >= 90 ? 'bg-red-600' :
                    metrics.progress >= 70 ? 'bg-yellow-600' :
                    'bg-green-600'
                  )}
                  style={{ width: `${metrics.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Avg. Spend / Day</span>
              <span className="text-sm font-medium text-foreground">
                {formatUSD(metrics.avgSpendPerDay)}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Info */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Campaign Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Target Contract</p>
              <p className="text-sm font-mono text-foreground">{campaign.targetContract}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Blockchain</p>
              <p className="text-sm text-foreground capitalize">{campaign.chain}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Goal Type</p>
              <p className="text-sm text-foreground capitalize">
                {campaign.goalType}
                {campaign.goalValue && ` (${formatNumber(campaign.goalValue)})`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <p className="text-sm text-foreground">{formatDate(campaign.startDate)}</p>
            </div>
            {campaign.endDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <p className="text-sm text-foreground">{formatDate(campaign.endDate)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Days Running</p>
              <p className="text-sm text-foreground">{metrics.daysRunning} days</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created</p>
              <p className="text-sm text-foreground">{formatDate(campaign.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Conversions Placeholder */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Recent Conversions
        </h3>
        <p className="text-sm text-muted-foreground/75 text-center py-8">
          Conversion tracking coming soon
        </p>
      </div>
    </div>
  );
}
