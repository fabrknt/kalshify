'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { cn } from '@fabrknt/ui';
import { Conversion } from '@/lib/mock-conversions';
import { formatUSD, formatDate } from '@/lib/utils/format';

export interface ConversionsTableProps {
  conversions: Conversion[];
}

const eventTypeColors = {
  mint: 'bg-purple-100 text-purple-700',
  swap: 'bg-blue-100 text-blue-700',
  stake: 'bg-green-100 text-green-700',
  vote: 'bg-yellow-100 text-yellow-700',
  transfer: 'bg-muted text-foreground/90',
  unstake: 'bg-orange-100 text-orange-700',
};

const chainColors = {
  ethereum: 'bg-blue-100 text-blue-700',
  base: 'bg-indigo-100 text-indigo-700',
  polygon: 'bg-purple-100 text-purple-700',
  solana: 'bg-green-100 text-green-700',
};

export function ConversionsTable({ conversions }: ConversionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination
  const totalPages = Math.ceil(conversions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedConversions = conversions.slice(startIndex, endIndex);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
    const baseUrls = {
      ethereum: 'https://etherscan.io/tx/',
      base: 'https://basescan.org/tx/',
      polygon: 'https://polygonscan.com/tx/',
      solana: 'https://solscan.io/tx/',
    };
    return baseUrls[chain as keyof typeof baseUrls] + txHash;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Wallet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Chain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground/75 uppercase tracking-wider">
                  TX Hash
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-gray-200">
              {paginatedConversions.map((conversion) => (
                <tr key={conversion.id} className="hover:bg-muted">
                  {/* Timestamp */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatDate(conversion.timestamp, 'MMM dd, HH:mm')}
                  </td>

                  {/* Wallet Address */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground/90">
                        {conversion.walletAddress}
                      </code>
                      <button
                        onClick={() => handleCopy(conversion.walletAddress, `wallet-${conversion.id}`)}
                        className="text-gray-400 hover:text-muted-foreground"
                      >
                        {copiedId === `wallet-${conversion.id}` ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Event Type */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        eventTypeColors[conversion.eventType]
                      )}
                    >
                      {conversion.eventType}
                    </span>
                  </td>

                  {/* Chain */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        chainColors[conversion.chain]
                      )}
                    >
                      {conversion.chain}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {conversion.valueUsd > 0 ? formatUSD(conversion.valueUsd) : '-'}
                  </td>

                  {/* Campaign */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/90">
                    {conversion.campaignName ? (
                      <Link
                        href={`/dashboard/campaigns/${conversion.campaignId}`}
                        className="text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        {conversion.campaignName.length > 20
                          ? conversion.campaignName.slice(0, 20) + '...'
                          : conversion.campaignName}
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">Organic</span>
                    )}
                  </td>

                  {/* TX Hash */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground/90">
                        {conversion.txHash}
                      </code>
                      <a
                        href={getExplorerUrl(conversion.chain, conversion.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-muted-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/90">Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-foreground/90">
            Showing {startIndex + 1}-{Math.min(endIndex, conversions.length)} of {conversions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Previous
          </button>
          <span className="text-sm text-foreground/90">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
