import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Target, ExternalLink } from 'lucide-react';
import { cn } from '@fabrknt/ui';
import { Campaign, calculateCampaignMetrics } from '@/lib/mock-campaigns';
import { formatUSD, formatNumber, formatDate } from '@/lib/utils/format';

export interface CampaignCardProps {
  campaign: Campaign;
}

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

export function CampaignCard({ campaign }: CampaignCardProps) {
  const metrics = calculateCampaignMetrics(campaign);

  return (
    <Link href={`/dashboard/campaigns/${campaign.id}`}>
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {campaign.name}
            </h3>
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
          <ExternalLink className="h-5 w-5 text-gray-400" />
        </div>

        {/* Contract Address */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Target Contract</p>
          <p className="text-sm font-mono text-foreground">{campaign.targetContract}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-muted-foreground/75" />
              <p className="text-sm text-muted-foreground">Clicks</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatNumber(campaign.clicks)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground/75" />
              <p className="text-sm text-muted-foreground">Conversions</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatNumber(campaign.conversions)}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground/75" />
              <p className="text-sm text-muted-foreground">Conv. Rate</p>
            </div>
            <p className="text-xl font-bold text-foreground">{campaign.conversionRate}%</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground/75" />
              <p className="text-sm text-muted-foreground">CPC</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatUSD(campaign.costPerConversion)}</p>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Budget</p>
            <p className="text-sm font-medium text-foreground">
              {formatUSD(campaign.spend)} / {formatUSD(campaign.budgetUsd)}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                metrics.progress >= 90 ? 'bg-red-600' :
                metrics.progress >= 70 ? 'bg-yellow-600' :
                'bg-green-600'
              )}
              style={{ width: `${metrics.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground/75">{metrics.progress.toFixed(1)}% spent</p>
            <p className="text-xs text-muted-foreground/75">{formatUSD(metrics.remaining)} remaining</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground/75">
            Started {formatDate(campaign.startDate)}
          </p>
          <p className="text-xs text-muted-foreground/75">
            {metrics.daysRunning} days running
          </p>
        </div>
      </div>
    </Link>
  );
}
