import { PoolForAI } from "../types";

function getRiskLabel(score: number, max: number): string {
    const ratio = score / max;
    if (ratio <= 0.33) return "low";
    if (ratio <= 0.66) return "medium";
    return "high";
}

export function buildInsightsPrompt(
    pool: PoolForAI,
    similarPools: PoolForAI[],
    historicalData?: { date: string; apy: number }[]
): string {
    const similarPoolsText = similarPools.slice(0, 3).map(p =>
        `- ${p.project} (${p.chain}): ${p.apy.toFixed(2)}% APY, Risk ${p.riskScore}/100`
    ).join("\n");

    let historySection = "";
    if (historicalData && historicalData.length > 0) {
        const apyValues = historicalData.map(d => d.apy);
        const minApy = Math.min(...apyValues);
        const maxApy = Math.max(...apyValues);
        const avgApy = apyValues.reduce((a, b) => a + b, 0) / apyValues.length;

        historySection = `
### APY History (${historicalData.length} days)
- Min: ${minApy.toFixed(2)}%
- Max: ${maxApy.toFixed(2)}%
- Average: ${avgApy.toFixed(2)}%
- Current: ${pool.apy.toFixed(2)}%
- Volatility: ${((maxApy - minApy) / avgApy * 100).toFixed(1)}% range`;
    }

    return `You are a DeFi analyst explaining a yield pool to an investor. Be factual, balanced, and specific.

## Pool Analysis
**${pool.project} - ${pool.symbol}** on ${pool.chain}

### Key Metrics
- Current APY: ${pool.apy.toFixed(2)}%
  - Base APY: ${pool.apyBase.toFixed(2)}% (from protocol fees/interest)
  - Reward APY: ${pool.apyReward.toFixed(2)}% (from token emissions)
- TVL: $${(pool.tvlUsd / 1_000_000).toFixed(1)}M
- Risk Score: ${pool.riskScore}/100 (${pool.riskLevel})

### Risk Breakdown (lower is better)
- TVL Risk: ${pool.riskBreakdown.tvlScore}/30 (${getRiskLabel(pool.riskBreakdown.tvlScore, 30)})
- APY Sustainability: ${pool.riskBreakdown.apyScore}/25 (${getRiskLabel(pool.riskBreakdown.apyScore, 25)})
- Asset Volatility: ${pool.riskBreakdown.stableScore}/20 (${getRiskLabel(pool.riskBreakdown.stableScore, 20)})
- Impermanent Loss: ${pool.riskBreakdown.ilScore}/15 (${getRiskLabel(pool.riskBreakdown.ilScore, 15)})
- Protocol Risk: ${pool.riskBreakdown.protocolScore}/10 (${getRiskLabel(pool.riskBreakdown.protocolScore, 10)})

### Liquidity & Exit
- Exitability: ${pool.liquidityRisk.exitabilityRating}
- Max Safe Allocation: $${(pool.liquidityRisk.maxSafeAllocation / 1_000).toFixed(0)}K
- Slippage at $100K exit: ${pool.liquidityRisk.slippageEstimates.at100k}%
- Slippage at $500K exit: ${pool.liquidityRisk.slippageEstimates.at500k}%

### Underlying Assets
${pool.underlyingAssets.join(", ")}

### Similar Pools for Comparison
${similarPoolsText || "No similar pools available"}
${historySection}

## Task
Provide a balanced, factual analysis. Focus on explaining WHY metrics are what they are.

Return ONLY valid JSON (no markdown):
{
  "riskExplanation": "2-3 sentences explaining the main factors contributing to the risk score. Be specific about which components are highest/lowest.",
  "opportunities": ["Specific opportunity 1", "Specific opportunity 2"],
  "risks": ["Specific risk 1", "Specific risk 2"],
  "apyStabilityAnalysis": "1-2 sentences on whether the APY is sustainable based on base vs reward ratio and history.",
  "comparison": {
    "vsSimilarPools": "1-2 sentences comparing to similar pools objectively.",
    "relativePosition": "above_average" or "average" or "below_average"
  },
  "verdict": "One sentence overall assessment for an investor considering this pool."
}`;
}
