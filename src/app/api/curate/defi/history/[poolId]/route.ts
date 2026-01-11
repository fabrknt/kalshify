import { NextRequest, NextResponse } from "next/server";

// Cache for 5 minutes
export const revalidate = 300;

const DEFILLAMA_CHART_API = "https://yields.llama.fi/chart";

interface DefiLlamaChartPoint {
    timestamp: string;
    tvlUsd: number;
    apy: number;
    apyBase: number | null;
    apyReward: number | null;
    il7d: number | null;
    apyBase7d: number | null;
}

interface ChartDataPoint {
    date: string;
    apy: number;
    apyBase: number;
    apyReward: number;
    tvlUsd: number;
}

async function fetchPoolHistory(poolId: string): Promise<DefiLlamaChartPoint[]> {
    const response = await fetch(`${DEFILLAMA_CHART_API}/${poolId}`, {
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch pool history: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
}

function filterByDays(data: DefiLlamaChartPoint[], days: number): DefiLlamaChartPoint[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return data.filter((point) => new Date(point.timestamp) >= cutoff);
}

function processChartData(data: DefiLlamaChartPoint[]): ChartDataPoint[] {
    return data.map((point) => ({
        date: point.timestamp,
        apy: Math.round(point.apy * 100) / 100,
        apyBase: Math.round((point.apyBase || point.apy) * 100) / 100,
        apyReward: Math.round((point.apyReward || 0) * 100) / 100,
        tvlUsd: point.tvlUsd,
    }));
}

function calculateStats(data: ChartDataPoint[]) {
    if (data.length === 0) {
        return { min: 0, max: 0, avg: 0, current: 0, change: 0 };
    }

    const apys = data.map((d) => d.apy);
    const min = Math.min(...apys);
    const max = Math.max(...apys);
    const avg = apys.reduce((a, b) => a + b, 0) / apys.length;
    const current = apys[apys.length - 1];
    const first = apys[0];
    const change = first !== 0 ? ((current - first) / first) * 100 : 0;

    return {
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        current: Math.round(current * 100) / 100,
        change: Math.round(change * 100) / 100,
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ poolId: string }> }
) {
    try {
        const { poolId } = await params;
        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        if (!poolId) {
            return NextResponse.json(
                { error: "Pool ID is required" },
                { status: 400 }
            );
        }

        // Validate days parameter
        const validDays = [7, 30, 90];
        const selectedDays = validDays.includes(days) ? days : 30;

        // Fetch historical data
        const rawData = await fetchPoolHistory(poolId);

        if (rawData.length === 0) {
            return NextResponse.json({
                poolId,
                days: selectedDays,
                data: [],
                stats: { min: 0, max: 0, avg: 0, current: 0, change: 0 },
            });
        }

        // Filter by date range
        const filteredData = filterByDays(rawData, selectedDays);

        // Process for chart
        const chartData = processChartData(filteredData);

        // Calculate stats
        const stats = calculateStats(chartData);

        return NextResponse.json({
            poolId,
            days: selectedDays,
            data: chartData,
            stats,
        });
    } catch (error) {
        console.error("GET /api/curate/defi/history/[poolId] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch pool history" },
            { status: 500 }
        );
    }
}
