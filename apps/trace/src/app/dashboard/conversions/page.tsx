import { Zap, TrendingUp, DollarSign, Target, Filter } from 'lucide-react';
import { Button } from '@fabrknt/ui';
import { ConversionsTable } from '@/components/dashboard/conversions-table';
import { getMockConversions, calculateConversionStats } from '@/lib/mock-conversions';
import { formatNumber, formatUSD, formatPercent } from '@/lib/utils/format';

export default function ConversionsPage() {
  const conversions = getMockConversions(100);
  const stats = calculateConversionStats(conversions);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Conversions</h1>
          <p className="text-muted-foreground mt-2">
            Track on-chain conversions and measure campaign attribution
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-600" />
            <p className="text-sm text-muted-foreground">Total Conversions</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatNumber(stats.totalConversions)}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">all time</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <p className="text-sm text-muted-foreground">Total Value</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatUSD(stats.totalValue)}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            avg. {formatUSD(stats.avgValue)}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-muted-foreground">Attribution Rate</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {stats.attributionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            {formatNumber(stats.attributedConversions)} attributed
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <p className="text-sm text-muted-foreground">Organic Conversions</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {formatNumber(stats.organicConversions)}
          </p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            {((stats.organicConversions / stats.totalConversions) * 100).toFixed(1)}% of total
          </p>
        </div>
      </div>

      {/* Event Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            By Event Type
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byEventType)
              .sort(([, a], [, b]) => b - a)
              .map(([eventType, count]) => (
                <div key={eventType} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/90 capitalize">{eventType}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalConversions) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            By Blockchain
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byChain)
              .sort(([, a], [, b]) => b - a)
              .map(([chain, count]) => (
                <div key={chain} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/90 capitalize">{chain}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalConversions) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Attribution Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          About Conversion Attribution
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            • <strong>Attributed:</strong> Conversions linked to a campaign via click tracking
          </p>
          <p>
            • <strong>Organic:</strong> Conversions without campaign attribution (direct interactions)
          </p>
          <p>
            • <strong>Value:</strong> USD value of the transaction at the time of conversion
          </p>
        </div>
      </div>

      {/* Conversions Table */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Recent Conversions
        </h2>
        <ConversionsTable conversions={conversions} />
      </div>
    </div>
  );
}
