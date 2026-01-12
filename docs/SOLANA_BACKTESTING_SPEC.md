# Solana Cross-Protocol Yield Backtesting - Technical Specification

## Overview

Build a cross-protocol yield strategy backtesting engine for Solana DeFi. Users can simulate historical performance of multi-protocol allocations across Kamino, Marginfi, Solend/Save, Meteora, and other Solana yield sources.

**Differentiator:** No existing Solana tool offers cross-protocol backtesting with AI-powered analysis. Kamino only backtests their own LP vaults.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CURATE Frontend                          │
├─────────────────────────────────────────────────────────────┤
│  StrategyBuilder  │  BacktestResults  │  AIAnalysis         │
└────────┬──────────┴─────────┬─────────┴─────────┬───────────┘
         │                    │                   │
         ▼                    ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
├─────────────────────────────────────────────────────────────┤
│  /api/solana/backtest     │  /api/solana/historical         │
│  /api/solana/protocols    │  /api/solana/ai-analysis        │
└────────┬──────────────────┴─────────┬───────────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────────┐    ┌─────────────────────────────────┐
│  Backtesting Engine │    │       Data Sources              │
│  (calculation)      │    ├─────────────────────────────────┤
└─────────────────────┘    │  DefiLlama API (historical)     │
                           │  Kamino API (rates/metrics)     │
                           │  On-chain RPCs (real-time)      │
                           │  Internal cache (PostgreSQL)    │
                           └─────────────────────────────────┘
```

---

## Data Sources

### 1. DefiLlama Yields API (Primary)

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /yields/pools` | List all pools with current APY | Free |
| `GET /yields/chart/{poolId}` | Historical APY/TVL for a pool | Free |
| `GET /yields/chartLendBorrow/{poolId}` | Historical lend/borrow rates | Free |

**Base URL:** `https://yields.llama.fi`

**Pool ID Format:** UUID (e.g., `d2141a59-c199-4be7-8d4b-c8223954836b` for Kamino USDC)

### 2. Kamino API

| Endpoint | Purpose |
|----------|---------|
| `GET /v2/kamino-market/:market/obligations/:obligation/metrics/history` | Historical obligation metrics |
| `GET /staking-rates/tokens/:mint/history` | Historical staking rates |
| `GET /staking-yields/tokens/:mint/history` | Historical staking yields with APY |

**Base URL:** `https://api.kamino.finance`

### 3. Protocol-Specific Sources

| Protocol | Data Source | Notes |
|----------|-------------|-------|
| **Kamino** | Kamino API + DefiLlama | Best historical coverage |
| **Marginfi** | DefiLlama | SDK for real-time only |
| **Save (Solend)** | DefiLlama | Historical via yields API |
| **Meteora** | DefiLlama | LP vault yields |
| **Jito** | DefiLlama + on-chain | LST yields |
| **Marinade** | DefiLlama | mSOL staking yields |

---

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
// Historical yield data cache
model SolanaYieldHistory {
  id          String   @id @default(cuid())
  poolId      String   // DefiLlama pool UUID
  protocol    String   // kamino, marginfi, solend, etc.
  chain       String   @default("Solana")
  symbol      String   // e.g., "USDC", "SOL"
  date        DateTime
  apy         Float
  apyBase     Float?
  apyReward   Float?
  tvlUsd      Float?

  @@unique([poolId, date])
  @@index([protocol, symbol, date])
  @@index([date])
}

// User backtest results
model BacktestResult {
  id              String   @id @default(cuid())
  userId          String
  name            String?
  createdAt       DateTime @default(now())

  // Strategy configuration
  strategyConfig  Json     // Allocation percentages per protocol
  initialAmount   Float
  startDate       DateTime
  endDate         DateTime
  rebalanceFreq   String   // daily, weekly, monthly, none

  // Results
  finalValue      Float
  totalReturn     Float    // Percentage
  annualizedReturn Float
  maxDrawdown     Float
  sharpeRatio     Float?

  // Comparison benchmarks
  vsSolStaking    Float    // Return vs simple SOL staking
  vsHodlSol       Float    // Return vs holding SOL
  vsHodlUsdc      Float    // Return vs holding USDC

  // AI analysis
  aiAnalysis      Json?

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

// Protocol metadata
model SolanaProtocol {
  id          String   @id @default(cuid())
  slug        String   @unique // kamino, marginfi, solend
  name        String
  category    String   // lending, lp, staking
  tvl         Float?
  riskScore   Int?     // 0-100
  audited     Boolean  @default(false)
  poolIds     String[] // DefiLlama pool IDs
  updatedAt   DateTime @updatedAt
}
```

---

## API Routes

### 1. Get Supported Protocols

`GET /api/solana/protocols`

```typescript
// src/app/api/solana/protocols/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SOLANA_PROTOCOLS = [
  {
    slug: "kamino",
    name: "Kamino Finance",
    category: "lending",
    pools: [
      { symbol: "USDC", poolId: "d2141a59-c199-4be7-8d4b-c8223954836b" },
      { symbol: "SOL", poolId: "..." },
      { symbol: "USDT", poolId: "..." },
    ],
  },
  {
    slug: "marginfi",
    name: "Marginfi",
    category: "lending",
    pools: [
      { symbol: "USDC", poolId: "..." },
      { symbol: "SOL", poolId: "..." },
    ],
  },
  {
    slug: "save",
    name: "Save (Solend)",
    category: "lending",
    pools: [
      { symbol: "USDC", poolId: "..." },
      { symbol: "SOL", poolId: "..." },
    ],
  },
  {
    slug: "jito",
    name: "Jito",
    category: "staking",
    pools: [
      { symbol: "JitoSOL", poolId: "..." },
    ],
  },
  {
    slug: "marinade",
    name: "Marinade",
    category: "staking",
    pools: [
      { symbol: "mSOL", poolId: "..." },
    ],
  },
  {
    slug: "meteora",
    name: "Meteora",
    category: "lp",
    pools: [
      { symbol: "USDC-SOL", poolId: "..." },
    ],
  },
];

export async function GET() {
  return NextResponse.json({ protocols: SOLANA_PROTOCOLS });
}
```

### 2. Fetch Historical Data

`GET /api/solana/historical?poolId={id}&days={30|90|180|365}`

```typescript
// src/app/api/solana/historical/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEFILLAMA_YIELDS_API = "https://yields.llama.fi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const poolId = searchParams.get("poolId");
  const days = parseInt(searchParams.get("days") || "30");

  if (!poolId) {
    return NextResponse.json({ error: "poolId required" }, { status: 400 });
  }

  // Check cache first
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const cached = await prisma.solanaYieldHistory.findMany({
    where: {
      poolId,
      date: { gte: cutoffDate },
    },
    orderBy: { date: "asc" },
  });

  // If we have recent cached data, return it
  if (cached.length > days * 0.8) {
    return NextResponse.json({ data: cached, source: "cache" });
  }

  // Fetch from DefiLlama
  const response = await fetch(`${DEFILLAMA_YIELDS_API}/chart/${poolId}`);
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  const data = await response.json();

  // Parse and filter by date range
  const historicalData = data.data
    .filter((d: any) => new Date(d.timestamp) >= cutoffDate)
    .map((d: any) => ({
      poolId,
      date: new Date(d.timestamp),
      apy: d.apy || 0,
      apyBase: d.apyBase || null,
      apyReward: d.apyReward || null,
      tvlUsd: d.tvlUsd || null,
    }));

  // Cache the data
  await Promise.all(
    historicalData.map((d: any) =>
      prisma.solanaYieldHistory.upsert({
        where: { poolId_date: { poolId: d.poolId, date: d.date } },
        update: d,
        create: { ...d, protocol: "unknown", chain: "Solana", symbol: "" },
      })
    )
  );

  return NextResponse.json({ data: historicalData, source: "defillama" });
}
```

### 3. Run Backtest

`POST /api/solana/backtest`

```typescript
// src/app/api/solana/backtest/route.ts
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runBacktest } from "@/lib/solana/backtesting-engine";
import { getYieldAdvisor } from "@/lib/ai/yield-advisor";

interface BacktestRequest {
  allocations: Array<{
    protocol: string;
    poolId: string;
    symbol: string;
    percentage: number; // 0-100
  }>;
  initialAmount: number; // USD
  startDate: string; // ISO date
  endDate: string;
  rebalanceFrequency: "daily" | "weekly" | "monthly" | "none";
  includeAiAnalysis?: boolean;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: BacktestRequest = await request.json();

  // Validate allocations sum to 100%
  const totalAllocation = body.allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (Math.abs(totalAllocation - 100) > 0.01) {
    return NextResponse.json({ error: "Allocations must sum to 100%" }, { status: 400 });
  }

  // Run backtest
  const result = await runBacktest({
    allocations: body.allocations,
    initialAmount: body.initialAmount,
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    rebalanceFrequency: body.rebalanceFrequency,
  });

  // Generate AI analysis if requested
  let aiAnalysis = null;
  if (body.includeAiAnalysis) {
    const advisor = getYieldAdvisor();
    if (advisor.isAvailable()) {
      aiAnalysis = await advisor.analyzeBacktestResult(result, body.allocations);
    }
  }

  // Save to database
  const savedResult = await prisma.backtestResult.create({
    data: {
      userId: user.id,
      strategyConfig: body.allocations,
      initialAmount: body.initialAmount,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      rebalanceFreq: body.rebalanceFrequency,
      finalValue: result.finalValue,
      totalReturn: result.totalReturn,
      annualizedReturn: result.annualizedReturn,
      maxDrawdown: result.maxDrawdown,
      sharpeRatio: result.sharpeRatio,
      vsSolStaking: result.vsSolStaking,
      vsHodlSol: result.vsHodlSol,
      vsHodlUsdc: result.vsHodlUsdc,
      aiAnalysis,
    },
  });

  return NextResponse.json({
    id: savedResult.id,
    result,
    aiAnalysis,
  });
}
```

---

## Backtesting Engine

```typescript
// src/lib/solana/backtesting-engine.ts
import { prisma } from "@/lib/db";
import Decimal from "decimal.js";

interface Allocation {
  protocol: string;
  poolId: string;
  symbol: string;
  percentage: number;
}

interface BacktestParams {
  allocations: Allocation[];
  initialAmount: number;
  startDate: Date;
  endDate: Date;
  rebalanceFrequency: "daily" | "weekly" | "monthly" | "none";
}

interface DailySnapshot {
  date: Date;
  portfolioValue: number;
  dailyReturn: number;
  allocations: Array<{
    poolId: string;
    value: number;
    apy: number;
  }>;
}

interface BacktestResult {
  finalValue: number;
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number | null;
  vsSolStaking: number;
  vsHodlSol: number;
  vsHodlUsdc: number;
  dailySnapshots: DailySnapshot[];
  periodReturns: {
    day7: number;
    day30: number;
    day90: number;
  };
}

export async function runBacktest(params: BacktestParams): Promise<BacktestResult> {
  const { allocations, initialAmount, startDate, endDate, rebalanceFrequency } = params;

  // Fetch historical data for all pools
  const poolIds = allocations.map((a) => a.poolId);
  const historicalData = await fetchHistoricalDataForPools(poolIds, startDate, endDate);

  // Initialize portfolio
  let portfolioValue = new Decimal(initialAmount);
  const dailySnapshots: DailySnapshot[] = [];
  let peakValue = portfolioValue;
  let maxDrawdown = new Decimal(0);
  const dailyReturns: number[] = [];

  // Current holdings (value per pool)
  let holdings = allocations.map((a) => ({
    poolId: a.poolId,
    value: new Decimal(initialAmount).mul(a.percentage).div(100),
  }));

  // Iterate through each day
  const currentDate = new Date(startDate);
  let lastRebalanceDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0];

    // Get APY for each pool on this date
    const dailyAllocations = holdings.map((h) => {
      const poolData = historicalData[h.poolId]?.find(
        (d) => d.date.toISOString().split("T")[0] === dateStr
      );
      const apy = poolData?.apy || 0;

      // Apply daily yield: dailyRate = (1 + APY/100)^(1/365) - 1
      const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1;
      const newValue = h.value.mul(1 + dailyRate);

      return {
        poolId: h.poolId,
        value: newValue.toNumber(),
        apy,
      };
    });

    // Update holdings
    holdings = dailyAllocations.map((a) => ({
      poolId: a.poolId,
      value: new Decimal(a.value),
    }));

    // Calculate portfolio value
    const previousValue = portfolioValue;
    portfolioValue = holdings.reduce((sum, h) => sum.add(h.value), new Decimal(0));

    // Track daily return
    const dailyReturn = portfolioValue.sub(previousValue).div(previousValue).toNumber();
    dailyReturns.push(dailyReturn);

    // Track max drawdown
    if (portfolioValue.gt(peakValue)) {
      peakValue = portfolioValue;
    }
    const drawdown = peakValue.sub(portfolioValue).div(peakValue);
    if (drawdown.gt(maxDrawdown)) {
      maxDrawdown = drawdown;
    }

    // Record snapshot
    dailySnapshots.push({
      date: new Date(currentDate),
      portfolioValue: portfolioValue.toNumber(),
      dailyReturn,
      allocations: dailyAllocations,
    });

    // Check if rebalance needed
    if (shouldRebalance(currentDate, lastRebalanceDate, rebalanceFrequency)) {
      holdings = rebalancePortfolio(holdings, allocations, portfolioValue);
      lastRebalanceDate = new Date(currentDate);
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate metrics
  const totalReturn = portfolioValue.sub(initialAmount).div(initialAmount).mul(100).toNumber();
  const dayCount = dailySnapshots.length;
  const annualizedReturn = (Math.pow(portfolioValue.toNumber() / initialAmount, 365 / dayCount) - 1) * 100;

  // Sharpe ratio (assuming 5% risk-free rate)
  const riskFreeDaily = Math.pow(1.05, 1 / 365) - 1;
  const excessReturns = dailyReturns.map((r) => r - riskFreeDaily);
  const avgExcessReturn = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length;
  const stdDev = Math.sqrt(
    excessReturns.reduce((sum, r) => sum + Math.pow(r - avgExcessReturn, 2), 0) / excessReturns.length
  );
  const sharpeRatio = stdDev > 0 ? (avgExcessReturn / stdDev) * Math.sqrt(365) : null;

  // Benchmark comparisons
  const benchmarks = await calculateBenchmarks(startDate, endDate, initialAmount);

  // Period returns
  const periodReturns = {
    day7: calculatePeriodReturn(dailySnapshots, 7),
    day30: calculatePeriodReturn(dailySnapshots, 30),
    day90: calculatePeriodReturn(dailySnapshots, 90),
  };

  return {
    finalValue: portfolioValue.toNumber(),
    totalReturn,
    annualizedReturn,
    maxDrawdown: maxDrawdown.mul(100).toNumber(),
    sharpeRatio,
    vsSolStaking: totalReturn - benchmarks.solStaking,
    vsHodlSol: totalReturn - benchmarks.hodlSol,
    vsHodlUsdc: totalReturn - benchmarks.hodlUsdc,
    dailySnapshots,
    periodReturns,
  };
}

async function fetchHistoricalDataForPools(
  poolIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Record<string, Array<{ date: Date; apy: number }>>> {
  const result: Record<string, Array<{ date: Date; apy: number }>> = {};

  for (const poolId of poolIds) {
    const data = await prisma.solanaYieldHistory.findMany({
      where: {
        poolId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });

    result[poolId] = data.map((d) => ({ date: d.date, apy: d.apy }));
  }

  return result;
}

function shouldRebalance(
  currentDate: Date,
  lastRebalance: Date,
  frequency: "daily" | "weekly" | "monthly" | "none"
): boolean {
  if (frequency === "none") return false;

  const daysSinceRebalance = Math.floor(
    (currentDate.getTime() - lastRebalance.getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (frequency) {
    case "daily":
      return daysSinceRebalance >= 1;
    case "weekly":
      return daysSinceRebalance >= 7;
    case "monthly":
      return daysSinceRebalance >= 30;
    default:
      return false;
  }
}

function rebalancePortfolio(
  holdings: Array<{ poolId: string; value: Decimal }>,
  targetAllocations: Allocation[],
  totalValue: Decimal
): Array<{ poolId: string; value: Decimal }> {
  return targetAllocations.map((a) => ({
    poolId: a.poolId,
    value: totalValue.mul(a.percentage).div(100),
  }));
}

async function calculateBenchmarks(
  startDate: Date,
  endDate: Date,
  initialAmount: number
): Promise<{ solStaking: number; hodlSol: number; hodlUsdc: number }> {
  // Fetch SOL staking yield (Jito or native)
  // Fetch SOL price change
  // USDC is baseline (0% return assumption)

  // TODO: Implement actual benchmark fetching
  return {
    solStaking: 7.5, // ~7.5% APY for SOL staking
    hodlSol: 0, // Depends on price action
    hodlUsdc: 0,
  };
}

function calculatePeriodReturn(snapshots: DailySnapshot[], days: number): number {
  if (snapshots.length < days) return 0;
  const startValue = snapshots[snapshots.length - days]?.portfolioValue || snapshots[0].portfolioValue;
  const endValue = snapshots[snapshots.length - 1].portfolioValue;
  return ((endValue - startValue) / startValue) * 100;
}
```

---

## AI Analysis Integration

```typescript
// src/lib/ai/prompts/backtest-analysis.ts
import { PoolForAI } from "../types";

export function buildBacktestAnalysisPrompt(
  result: any,
  allocations: any[]
): string {
  return `You are a DeFi yield analyst. Analyze this backtest result and provide insights.

## Strategy Configuration
${allocations.map((a) => `- ${a.protocol} ${a.symbol}: ${a.percentage}%`).join("\n")}

## Performance Results
- Initial Amount: $${result.initialAmount.toLocaleString()}
- Final Value: $${result.finalValue.toLocaleString()}
- Total Return: ${result.totalReturn.toFixed(2)}%
- Annualized Return: ${result.annualizedReturn.toFixed(2)}%
- Max Drawdown: ${result.maxDrawdown.toFixed(2)}%
- Sharpe Ratio: ${result.sharpeRatio?.toFixed(2) || "N/A"}

## Benchmark Comparison
- vs SOL Staking: ${result.vsSolStaking > 0 ? "+" : ""}${result.vsSolStaking.toFixed(2)}%
- vs Holding SOL: ${result.vsHodlSol > 0 ? "+" : ""}${result.vsHodlSol.toFixed(2)}%
- vs Holding USDC: ${result.vsHodlUsdc > 0 ? "+" : ""}${result.vsHodlUsdc.toFixed(2)}%

Provide a JSON response with:
{
  "summary": "2-3 sentence executive summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "riskAssessment": "low | moderate | high | very_high",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "marketConditions": "How this strategy would perform in different market conditions",
  "improvementSuggestions": ["suggestion 1", "suggestion 2"]
}`;
}
```

---

## Frontend Components

### 1. Strategy Builder

```typescript
// src/components/solana/strategy-builder.tsx
"use client";

import { useState } from "react";
import { Plus, Minus, Play } from "lucide-react";

interface Allocation {
  protocol: string;
  poolId: string;
  symbol: string;
  percentage: number;
}

interface StrategyBuilderProps {
  onRunBacktest: (config: {
    allocations: Allocation[];
    startDate: string;
    endDate: string;
    initialAmount: number;
    rebalanceFrequency: string;
  }) => void;
}

const PROTOCOLS = [
  { slug: "kamino", name: "Kamino", pools: ["USDC", "SOL", "USDT"] },
  { slug: "marginfi", name: "Marginfi", pools: ["USDC", "SOL"] },
  { slug: "save", name: "Save (Solend)", pools: ["USDC", "SOL"] },
  { slug: "jito", name: "Jito Staking", pools: ["JitoSOL"] },
  { slug: "marinade", name: "Marinade", pools: ["mSOL"] },
];

export function StrategyBuilder({ onRunBacktest }: StrategyBuilderProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([
    { protocol: "kamino", poolId: "", symbol: "USDC", percentage: 50 },
    { protocol: "marginfi", poolId: "", symbol: "SOL", percentage: 50 },
  ]);
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-12-31");
  const [initialAmount, setInitialAmount] = useState(10000);
  const [rebalanceFrequency, setRebalanceFrequency] = useState("monthly");

  const totalAllocation = allocations.reduce((sum, a) => sum + a.percentage, 0);

  const addAllocation = () => {
    setAllocations([
      ...allocations,
      { protocol: "kamino", poolId: "", symbol: "USDC", percentage: 0 },
    ]);
  };

  const removeAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const updateAllocation = (index: number, field: keyof Allocation, value: any) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    setAllocations(updated);
  };

  return (
    <div className="bg-slate-900 rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Build Your Strategy</h2>

      {/* Allocations */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-400">Allocations</h3>
          <span className={`text-sm ${totalAllocation === 100 ? "text-green-400" : "text-red-400"}`}>
            Total: {totalAllocation}%
          </span>
        </div>

        {allocations.map((alloc, index) => (
          <div key={index} className="flex gap-3 items-center">
            <select
              value={alloc.protocol}
              onChange={(e) => updateAllocation(index, "protocol", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            >
              {PROTOCOLS.map((p) => (
                <option key={p.slug} value={p.slug}>{p.name}</option>
              ))}
            </select>

            <select
              value={alloc.symbol}
              onChange={(e) => updateAllocation(index, "symbol", e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            >
              {PROTOCOLS.find((p) => p.slug === alloc.protocol)?.pools.map((pool) => (
                <option key={pool} value={pool}>{pool}</option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              max="100"
              value={alloc.percentage}
              onChange={(e) => updateAllocation(index, "percentage", parseInt(e.target.value) || 0)}
              className="w-20 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            />
            <span className="text-slate-400">%</span>

            <button
              onClick={() => removeAllocation(index)}
              className="p-2 text-red-400 hover:text-red-300"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
        ))}

        <button
          onClick={addAllocation}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <Plus className="h-4 w-4" /> Add Allocation
        </button>
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Initial Amount (USD)</label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(parseInt(e.target.value) || 0)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Rebalance</label>
          <select
            value={rebalanceFrequency}
            onChange={(e) => setRebalanceFrequency(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
          >
            <option value="none">No Rebalancing</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={() => onRunBacktest({ allocations, startDate, endDate, initialAmount, rebalanceFrequency })}
        disabled={totalAllocation !== 100}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg"
      >
        <Play className="h-5 w-5" />
        Run Backtest
      </button>
    </div>
  );
}
```

### 2. Backtest Results

```typescript
// src/components/solana/backtest-results.tsx
"use client";

import { TrendingUp, TrendingDown, AlertTriangle, Sparkles } from "lucide-react";

interface BacktestResultsProps {
  result: {
    finalValue: number;
    totalReturn: number;
    annualizedReturn: number;
    maxDrawdown: number;
    sharpeRatio: number | null;
    vsSolStaking: number;
    vsHodlSol: number;
    vsHodlUsdc: number;
    dailySnapshots: Array<{ date: Date; portfolioValue: number }>;
  };
  aiAnalysis?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    riskAssessment: string;
    recommendations: string[];
  };
  initialAmount: number;
}

export function BacktestResults({ result, aiAnalysis, initialAmount }: BacktestResultsProps) {
  const isPositive = result.totalReturn > 0;

  return (
    <div className="bg-slate-900 rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Backtest Results</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Final Value"
          value={`$${result.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtext={`from $${initialAmount.toLocaleString()}`}
        />
        <MetricCard
          label="Total Return"
          value={`${isPositive ? "+" : ""}${result.totalReturn.toFixed(2)}%`}
          positive={isPositive}
        />
        <MetricCard
          label="Annualized Return"
          value={`${result.annualizedReturn.toFixed(2)}%`}
          positive={result.annualizedReturn > 0}
        />
        <MetricCard
          label="Max Drawdown"
          value={`-${result.maxDrawdown.toFixed(2)}%`}
          warning={result.maxDrawdown > 20}
        />
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">vs Benchmarks</h3>
        <div className="grid grid-cols-3 gap-4">
          <BenchmarkComparison label="vs SOL Staking" diff={result.vsSolStaking} />
          <BenchmarkComparison label="vs HODL SOL" diff={result.vsHodlSol} />
          <BenchmarkComparison label="vs HODL USDC" diff={result.vsHodlUsdc} />
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3">Risk Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-sm">Sharpe Ratio</p>
            <p className="text-white text-lg font-semibold">
              {result.sharpeRatio?.toFixed(2) || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Max Drawdown</p>
            <p className="text-white text-lg font-semibold">-{result.maxDrawdown.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">AI Analysis</h3>
          </div>
          <p className="text-slate-300 text-sm mb-4">{aiAnalysis.summary}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-green-400 text-xs font-semibold mb-2">Strengths</p>
              <ul className="text-sm text-slate-400 space-y-1">
                {aiAnalysis.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-red-400 text-xs font-semibold mb-2">Weaknesses</p>
              <ul className="text-sm text-slate-400 space-y-1">
                {aiAnalysis.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {aiAnalysis.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-cyan-400 text-xs font-semibold mb-2">Recommendations</p>
              <ul className="text-sm text-slate-400 space-y-1">
                {aiAnalysis.recommendations.map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  positive,
  warning,
}: {
  label: string;
  value: string;
  subtext?: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <p className="text-slate-500 text-xs">{label}</p>
      <p
        className={`text-xl font-bold ${
          warning ? "text-orange-400" : positive === true ? "text-green-400" : positive === false ? "text-red-400" : "text-white"
        }`}
      >
        {value}
      </p>
      {subtext && <p className="text-slate-600 text-xs">{subtext}</p>}
    </div>
  );
}

function BenchmarkComparison({ label, diff }: { label: string; diff: number }) {
  const isPositive = diff > 0;
  return (
    <div className="text-center">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className={`text-lg font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "+" : ""}{diff.toFixed(2)}%
      </p>
    </div>
  );
}
```

---

## Implementation Phases

### Phase 1: Data Infrastructure (Week 1-2)
- [ ] Add Prisma schema for yield history and backtest results
- [ ] Build historical data fetcher from DefiLlama
- [ ] Implement data caching layer
- [ ] Map Solana protocol pool IDs

### Phase 2: Backtesting Engine (Week 3-4)
- [ ] Implement core backtesting calculations
- [ ] Add rebalancing logic
- [ ] Calculate risk metrics (Sharpe, drawdown)
- [ ] Add benchmark comparisons

### Phase 3: Frontend (Week 5-6)
- [ ] Build StrategyBuilder component
- [ ] Build BacktestResults visualization
- [ ] Add portfolio value chart
- [ ] Implement comparison views

### Phase 4: AI Integration (Week 7)
- [ ] Add backtest analysis prompt
- [ ] Integrate with YieldAdvisor service
- [ ] Build AI insights UI component
- [ ] Test and refine prompts

### Phase 5: Polish & Launch (Week 8)
- [ ] Performance optimization
- [ ] Error handling
- [ ] User testing
- [ ] Documentation

---

## Data Collection Schedule

To maintain accurate historical data:

```typescript
// Cron job: Run daily at 00:00 UTC
// src/lib/cron/sync-solana-yields.ts

export async function syncSolanaYields() {
  const protocols = await prisma.solanaProtocol.findMany();

  for (const protocol of protocols) {
    for (const poolId of protocol.poolIds) {
      // Fetch latest data from DefiLlama
      const response = await fetch(`https://yields.llama.fi/chart/${poolId}`);
      const data = await response.json();

      // Get latest entry
      const latest = data.data[data.data.length - 1];

      // Upsert to database
      await prisma.solanaYieldHistory.upsert({
        where: { poolId_date: { poolId, date: new Date(latest.timestamp) } },
        update: {
          apy: latest.apy,
          apyBase: latest.apyBase,
          apyReward: latest.apyReward,
          tvlUsd: latest.tvlUsd,
        },
        create: {
          poolId,
          protocol: protocol.slug,
          chain: "Solana",
          symbol: "", // TODO: Map from protocol config
          date: new Date(latest.timestamp),
          apy: latest.apy,
          apyBase: latest.apyBase,
          apyReward: latest.apyReward,
          tvlUsd: latest.tvlUsd,
        },
      });
    }
  }
}
```

---

## Security Considerations

1. **Rate Limiting** - Limit backtest requests per user per day
2. **Input Validation** - Validate date ranges, allocation percentages
3. **Data Integrity** - Verify historical data source authenticity
4. **No Private Keys** - Read-only operation, no wallet interaction
5. **Cache Invalidation** - Clear stale data periodically

---

## References

- [DefiLlama API Docs](https://api-docs.defillama.com/)
- [Kamino API Docs](https://github.com/Kamino-Finance/kamino-api-docs)
- [Marginfi SDK](https://docs.marginfi.com/ts-sdk)
- [Solana Lending Markets Report 2025](https://blog.redstone.finance/2025/12/11/solana-lending-markets/)
