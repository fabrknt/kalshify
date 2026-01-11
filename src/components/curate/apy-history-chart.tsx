"use client";

import { useState, useEffect } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format } from "date-fns";

interface ChartDataPoint {
    date: string;
    apy: number;
    apyBase: number;
    apyReward: number;
    tvlUsd: number;
}

interface ChartStats {
    min: number;
    max: number;
    avg: number;
    current: number;
    change: number;
}

interface ApyHistoryChartProps {
    poolId: string;
}

const TIME_RANGES = [
    { label: "7D", days: 7 },
    { label: "30D", days: 30 },
    { label: "90D", days: 90 },
];

function formatTvl(value: number): string {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${(value / 1_000).toFixed(0)}K`;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataPoint }> }) {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const date = new Date(data.date);

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
            <p className="text-slate-400 text-xs mb-2">
                {format(date, "MMM d, yyyy")}
            </p>
            <div className="space-y-1">
                <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-400">APY</span>
                    <span className="text-cyan-400 font-medium">{data.apy}%</span>
                </div>
                {data.apyReward > 0 && (
                    <>
                        <div className="flex justify-between gap-4 text-xs">
                            <span className="text-slate-500">Base</span>
                            <span className="text-green-400">{data.apyBase}%</span>
                        </div>
                        <div className="flex justify-between gap-4 text-xs">
                            <span className="text-slate-500">Reward</span>
                            <span className="text-amber-400">{data.apyReward}%</span>
                        </div>
                    </>
                )}
                <div className="flex justify-between gap-4 text-xs pt-1 border-t border-slate-700">
                    <span className="text-slate-500">TVL</span>
                    <span className="text-slate-300">{formatTvl(data.tvlUsd)}</span>
                </div>
            </div>
        </div>
    );
}

export function ApyHistoryChart({ poolId }: ApyHistoryChartProps) {
    const [days, setDays] = useState(30);
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [stats, setStats] = useState<ChartStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/curate/defi/history/${encodeURIComponent(poolId)}?days=${days}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch history");
                }

                const result = await response.json();
                setData(result.data);
                setStats(result.stats);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load");
            } finally {
                setLoading(false);
            }
        }

        fetchHistory();
    }, [poolId, days]);

    const formatXAxis = (dateStr: string) => {
        const date = new Date(dateStr);
        if (days <= 7) return format(date, "MMM d");
        if (days <= 30) return format(date, "MMM d");
        return format(date, "MMM");
    };

    const TrendIcon = stats?.change && stats.change > 0.5
        ? TrendingUp
        : stats?.change && stats.change < -0.5
        ? TrendingDown
        : Minus;

    const trendColor = stats?.change && stats.change > 0.5
        ? "text-green-400"
        : stats?.change && stats.change < -0.5
        ? "text-red-400"
        : "text-slate-400";

    return (
        <div className="space-y-3">
            {/* Header with time range selector */}
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">APY History</h4>
                <div className="flex gap-1">
                    {TIME_RANGES.map((range) => (
                        <button
                            key={range.days}
                            onClick={() => setDays(range.days)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                                days === range.days
                                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                            }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            {stats && !loading && (
                <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                        <span className="text-slate-500">Current</span>
                        <p className="text-cyan-400 font-medium">{stats.current}%</p>
                    </div>
                    <div>
                        <span className="text-slate-500">Avg</span>
                        <p className="text-slate-300">{stats.avg}%</p>
                    </div>
                    <div>
                        <span className="text-slate-500">Range</span>
                        <p className="text-slate-300">{stats.min}% - {stats.max}%</p>
                    </div>
                    <div>
                        <span className="text-slate-500">Change</span>
                        <p className={`flex items-center gap-1 ${trendColor}`}>
                            <TrendIcon className="h-3 w-3" />
                            {stats.change > 0 ? "+" : ""}{stats.change}%
                        </p>
                    </div>
                </div>
            )}

            {/* Chart */}
            <div className="h-[160px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        {error}
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        No historical data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="apyGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                tickFormatter={formatXAxis}
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="apy"
                                stroke="#22d3ee"
                                strokeWidth={2}
                                fill="url(#apyGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
