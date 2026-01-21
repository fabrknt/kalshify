'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TerminalContainer } from '@/components/intel/terminal-container';
import { TerminalHeader } from '@/components/intel/terminal-header';
import { SignalCard } from '@/components/intel/signal-card';
import { ScanAnimation } from '@/components/intel/scan-animation';
import { RefreshCw, Filter, ChevronDown, Radio } from 'lucide-react';

interface IntelSignal {
  id: string;
  createdAt: string;
  type: string;
  severity: string;
  ticker: string | null;
  marketTitle: string | null;
  title: string;
  description: string;
  data: Record<string, unknown>;
  sourceType: string | null;
  sourceHandle: string | null;
  sourceUrl: string | null;
  isRead: boolean;
}

interface IntelResponse {
  signals: IntelSignal[];
  total: number;
  unreadCount: number;
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats?: {
    totalSignals: number;
    recentSignals: number;
    criticalCount: number;
    highCount: number;
    typeBreakdown: { type: string; count: number }[];
  };
}

type FilterType = 'ALL' | 'VOLUME_SPIKE' | 'WHALE_ALERT' | 'SOCIAL_INTEL' | 'PRICE_MOVE' | 'SPREAD_CHANGE';
type FilterSeverity = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export default function IntelPage() {
  const [signals, setSignals] = useState<IntelSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('ALL');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

  // Live Mode
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [newSignalIds, setNewSignalIds] = useState<Set<string>>(new Set());
  const previousSignalIds = useRef<Set<string>>(new Set());

  const fetchSignals = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      params.set('stats', 'true');
      if (filterType !== 'ALL') params.set('type', filterType);
      if (filterSeverity !== 'ALL') params.set('severity', filterSeverity);

      const response = await fetch(`/api/intel?${params}`);
      if (!response.ok) throw new Error('Failed to fetch signals');

      const data: IntelResponse = await response.json();

      // Track new signals for highlighting
      const currentIds = new Set(data.signals.map((s) => s.id));
      const newIds = new Set<string>();

      if (previousSignalIds.current.size > 0) {
        data.signals.forEach((signal) => {
          if (!previousSignalIds.current.has(signal.id)) {
            newIds.add(signal.id);
          }
        });
      }

      previousSignalIds.current = currentIds;
      setNewSignalIds(newIds);

      // Clear new signal highlighting after 5 seconds
      if (newIds.size > 0) {
        setTimeout(() => setNewSignalIds(new Set()), 5000);
      }

      setSignals(data.signals);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load signals');
    } finally {
      setIsLoading(false);
    }
  }, [filterType, filterSeverity]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Auto-refresh: 10 seconds in live mode, 60 seconds otherwise
  useEffect(() => {
    const interval = setInterval(fetchSignals, isLiveMode ? 10000 : 60000);
    return () => clearInterval(interval);
  }, [fetchSignals, isLiveMode]);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/intel/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all' }),
      });

      if (!response.ok) throw new Error('Scan failed');

      setLastScan(new Date());
      await fetchSignals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const typeOptions: { value: FilterType; label: string }[] = [
    { value: 'ALL', label: 'ALL TYPES' },
    { value: 'VOLUME_SPIKE', label: 'VOLUME' },
    { value: 'WHALE_ALERT', label: 'WHALE' },
    { value: 'SOCIAL_INTEL', label: 'SOCIAL' },
    { value: 'PRICE_MOVE', label: 'PRICE' },
    { value: 'SPREAD_CHANGE', label: 'SPREAD' },
  ];

  const severityOptions: { value: FilterSeverity; label: string }[] = [
    { value: 'ALL', label: 'ALL SEVERITY' },
    { value: 'CRITICAL', label: 'CRITICAL' },
    { value: 'HIGH', label: 'HIGH' },
    { value: 'MEDIUM', label: 'MEDIUM' },
    { value: 'LOW', label: 'LOW' },
  ];

  return (
    <TerminalContainer>
      <TerminalHeader
        status={isScanning ? 'SCANNING' : isLiveMode ? 'LIVE' : 'ONLINE'}
        lastScan={lastScan}
        signalsCount={signals.length}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-sm font-mono"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'SCANNING...' : 'SCAN NOW'}
          </button>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-green-600" />

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowSeverityDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded text-xs font-mono"
              >
                {typeOptions.find((o) => o.value === filterType)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showTypeDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-[#0a0a0a] border border-green-500/30 rounded z-50 min-w-[120px]">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterType(option.value);
                        setShowTypeDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-green-500/20 ${
                        filterType === option.value ? 'text-green-400 bg-green-500/10' : 'text-green-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Severity Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSeverityDropdown(!showSeverityDropdown);
                  setShowTypeDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded text-xs font-mono"
              >
                {severityOptions.find((o) => o.value === filterSeverity)?.label}
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSeverityDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-[#0a0a0a] border border-green-500/30 rounded z-50 min-w-[120px]">
                  {severityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterSeverity(option.value);
                        setShowSeverityDropdown(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-green-500/20 ${
                        filterSeverity === option.value ? 'text-green-400 bg-green-500/10' : 'text-green-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Mode Toggle */}
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
              isLiveMode
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20'
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveMode ? 'animate-pulse' : ''}`} />
            {isLiveMode ? 'LIVE' : 'LIVE MODE'}
          </button>

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono rounded border border-amber-500/30">
              {unreadCount} UNREAD
            </span>
          )}
        </div>

        {/* Scan Animation */}
        {isScanning && (
          <div className="mb-6">
            <ScanAnimation isScanning={isScanning} />
          </div>
        )}

        {/* Divider */}
        <div className="text-green-600 text-xs mb-6 overflow-hidden">
          {'═'.repeat(80)}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 font-mono text-sm">
            [ERROR] {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && !isScanning && (
          <div className="text-center py-12">
            <div className="text-green-500 animate-pulse text-sm font-mono">
              LOADING INTEL FEED...
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && signals.length === 0 && (
          <div className="text-center py-12 border border-green-500/20 rounded">
            <div className="text-green-600 text-sm font-mono mb-4">
              NO SIGNALS DETECTED
            </div>
            <p className="text-green-700 text-xs font-mono mb-4">
              Click SCAN NOW to scan markets for anomalies
            </p>
            <button
              onClick={handleScan}
              disabled={isScanning}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 rounded text-sm font-mono"
            >
              INITIATE SCAN
            </button>
          </div>
        )}

        {/* Signals List */}
        {!isLoading && signals.length > 0 && (
          <>
            <div className="space-y-4">
              {signals.map((signal) => (
                <SignalCard
                  key={signal.id}
                  signal={signal}
                  isNew={newSignalIds.has(signal.id)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-green-600 text-xs font-mono">
              &gt; Displaying {signals.length} signal{signals.length !== 1 ? 's' : ''}_
            </div>
          </>
        )}
      </main>

      {/* Footer info */}
      <footer className="max-w-7xl mx-auto px-4 py-6 border-t border-green-500/20 mt-8">
        <div className="text-green-700 text-xs font-mono text-center">
          KALSHIFY INTEL TERMINAL | Market data from Kalshi | Social data from public sources
          <br />
          <span className="text-green-800">
            This is not financial advice. Paper trading only.
          </span>
        </div>
      </footer>
    </TerminalContainer>
  );
}
