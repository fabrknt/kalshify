import Link from 'next/link';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@fabrknt/ui';
import { CampaignCard } from '@/components/dashboard/campaign-card';
import { getMockCampaigns } from '@/lib/mock-campaigns';
import { formatNumber } from '@/lib/utils/format';

export default function CampaignsPage() {
  const campaigns = getMockCampaigns();
  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  // Calculate totals
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const avgConversionRate = campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track your marketing campaigns
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-5 w-5 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Campaigns</p>
          <p className="text-3xl font-bold text-foreground">{campaigns.length}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            {activeCampaigns.length} active
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Clicks</p>
          <p className="text-3xl font-bold text-foreground">{formatNumber(totalClicks)}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">across all campaigns</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Conversions</p>
          <p className="text-3xl font-bold text-foreground">{formatNumber(totalConversions)}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            {avgConversionRate.toFixed(1)}% avg. rate
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Spend</p>
          <p className="text-3xl font-bold text-foreground">
            ${formatNumber(totalSpend)}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">lifetime spend</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          All Campaigns
        </Button>
        <Button variant="ghost" size="sm">
          Active ({activeCampaigns.length})
        </Button>
        <Button variant="ghost" size="sm">
          Paused ({pausedCampaigns.length})
        </Button>
        <Button variant="ghost" size="sm">
          Completed ({completedCampaigns.length})
        </Button>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Active Campaigns ({activeCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Paused Campaigns */}
      {pausedCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Paused Campaigns ({pausedCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pausedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Campaigns */}
      {completedCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Completed Campaigns ({completedCampaigns.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {campaigns.length === 0 && (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <p className="text-muted-foreground mb-4">No campaigns yet</p>
          <Link href="/dashboard/campaigns/new">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Create Your First Campaign
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
