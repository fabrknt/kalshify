/**
 * Market Context
 * Provides weekly market updates and context for DeFi allocations
 */

export interface MarketTrend {
    metric: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: "up" | "down" | "stable";
    context: string;
}

export interface ProtocolUpdate {
    protocol: string;
    type: "news" | "apy_change" | "tvl_change" | "risk_change" | "new_pool";
    severity: "info" | "positive" | "warning";
    title: string;
    description: string;
    impact?: string;
    date: Date;
}

export interface MarketHighlight {
    title: string;
    description: string;
    type: "opportunity" | "risk" | "trend" | "education";
    actionable?: string;
}

export interface WeeklyMarketContext {
    weekOf: Date;
    weekEnd: Date;
    summary: string;
    sentiment: "bullish" | "neutral" | "bearish" | "cautious";
    trends: MarketTrend[];
    protocolUpdates: ProtocolUpdate[];
    highlights: MarketHighlight[];
    yieldEnvironment: {
        overall: "high" | "normal" | "low";
        stablecoinAvgApy: number;
        lstAvgApy: number;
        lpAvgApy: number;
        weeklyChange: number;
    };
    riskSnapshot: {
        marketVolatility: "low" | "medium" | "high";
        defiRiskLevel: "normal" | "elevated" | "high";
        recommendedAction: string;
    };
}

// Generate dates for current week
function getCurrentWeekDates(): { start: Date; end: Date } {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// Mock market data - in production this would be fetched from APIs
function generateMarketTrends(): MarketTrend[] {
    return [
        {
            metric: "Solana DeFi TVL",
            current: 8.2e9,
            previous: 7.8e9,
            change: 0.4e9,
            changePercent: 5.1,
            trend: "up",
            context: "Continued growth driven by new LST launches and lending protocol expansion",
        },
        {
            metric: "SOL Price",
            current: 185,
            previous: 172,
            change: 13,
            changePercent: 7.6,
            trend: "up",
            context: "SOL outperforming broader crypto market, positive for LST yields",
        },
        {
            metric: "Avg Stablecoin APY",
            current: 6.2,
            previous: 6.8,
            change: -0.6,
            changePercent: -8.8,
            trend: "down",
            context: "Slight compression as lending supply increases, still attractive vs TradFi",
        },
        {
            metric: "Avg LST APY",
            current: 7.8,
            previous: 7.5,
            change: 0.3,
            changePercent: 4.0,
            trend: "up",
            context: "MEV rewards increasing with network activity",
        },
        {
            metric: "JLP Vault APY",
            current: 32,
            previous: 38,
            change: -6,
            changePercent: -15.8,
            trend: "down",
            context: "Lower trading volume reducing perp fees, still significantly above average",
        },
    ];
}

function generateProtocolUpdates(): ProtocolUpdate[] {
    const now = new Date();
    return [
        {
            protocol: "Kamino",
            type: "news",
            severity: "positive",
            title: "Kamino Multiply v2 Launch",
            description: "New leverage strategies with improved risk management and auto-deleveraging.",
            impact: "More efficient SOL leverage positions with lower liquidation risk",
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            protocol: "Jupiter",
            type: "apy_change",
            severity: "info",
            title: "JLP APY Normalized",
            description: "JLP yields settling to ~30-35% range after volatility spike.",
            impact: "Sustainable yield level for long-term JLP positions",
            date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            protocol: "Jito",
            type: "tvl_change",
            severity: "positive",
            title: "JitoSOL Hits $2B TVL",
            description: "Continued strong inflows into JitoSOL, now largest LST on Solana.",
            impact: "Strong market confidence in MEV-powered staking",
            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            protocol: "Meteora",
            type: "new_pool",
            severity: "info",
            title: "New DLMM Pools Available",
            description: "Additional concentrated liquidity pools for major trading pairs.",
            impact: "More yield opportunities for active LP managers",
            date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        },
        {
            protocol: "Drift",
            type: "risk_change",
            severity: "warning",
            title: "Insurance Fund Drawdown",
            description: "Minor insurance fund usage during recent volatility, fully recovered.",
            impact: "Temporary reminder of perp vault risks during market moves",
            date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
    ];
}

function generateHighlights(): MarketHighlight[] {
    return [
        {
            title: "LST Season Continues",
            description: "Liquid staking tokens remain the sweet spot for risk-adjusted returns. JitoSOL and mSOL offer 7-8% with relatively low smart contract risk.",
            type: "opportunity",
            actionable: "Consider increasing LST allocation if underweight",
        },
        {
            title: "Stablecoin Yield Compression",
            description: "USDC lending rates have dropped ~10% this week as supply increases. Still competitive vs traditional savings at 5-6%.",
            type: "trend",
        },
        {
            title: "LP Impermanent Loss Warning",
            description: "With SOL up 7%+ this week, LP positions experienced notable IL. Monitor your LP allocations if you have significant exposure.",
            type: "risk",
            actionable: "Review LP positions and consider rebalancing if IL exceeds fee earnings",
        },
        {
            title: "Understanding MEV Rewards",
            description: "JitoSOL's extra yield comes from MEV (Maximal Extractable Value) sharing. This is protocol revenue from transaction ordering, not unsustainable emissions.",
            type: "education",
        },
    ];
}

export function getWeeklyMarketContext(): WeeklyMarketContext {
    const { start, end } = getCurrentWeekDates();

    const trends = generateMarketTrends();
    const protocolUpdates = generateProtocolUpdates();
    const highlights = generateHighlights();

    // Calculate yield environment
    const stablecoinTrend = trends.find(t => t.metric.includes("Stablecoin"));
    const lstTrend = trends.find(t => t.metric.includes("LST"));

    // Determine overall sentiment
    const positiveUpdates = protocolUpdates.filter(u => u.severity === "positive").length;
    const warningUpdates = protocolUpdates.filter(u => u.severity === "warning").length;
    const tvlTrend = trends.find(t => t.metric.includes("TVL"));

    let sentiment: "bullish" | "neutral" | "bearish" | "cautious" = "neutral";
    if (tvlTrend && tvlTrend.trend === "up" && positiveUpdates > warningUpdates) {
        sentiment = "bullish";
    } else if (warningUpdates > positiveUpdates) {
        sentiment = "cautious";
    }

    return {
        weekOf: start,
        weekEnd: end,
        summary: "Solana DeFi continues growth trajectory with TVL up 5%. LST yields improving while stablecoin rates see mild compression. Overall healthy market conditions favor balanced allocations.",
        sentiment,
        trends,
        protocolUpdates,
        highlights,
        yieldEnvironment: {
            overall: "normal",
            stablecoinAvgApy: stablecoinTrend?.current || 6.2,
            lstAvgApy: lstTrend?.current || 7.8,
            lpAvgApy: 18.5,
            weeklyChange: -2.3,
        },
        riskSnapshot: {
            marketVolatility: "medium",
            defiRiskLevel: "normal",
            recommendedAction: "Maintain current allocation strategy. Good time for gradual position building.",
        },
    };
}

export function formatTrendValue(metric: string, value: number): string {
    if (metric.includes("TVL")) {
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
        return `$${value.toFixed(0)}`;
    }
    if (metric.includes("Price")) {
        return `$${value.toFixed(0)}`;
    }
    if (metric.includes("APY")) {
        return `${value.toFixed(1)}%`;
    }
    return value.toFixed(2);
}

export function getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}
