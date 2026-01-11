import { UserPreferences, PoolForAI } from "../types";

export function buildRecommendationsPrompt(
    pools: PoolForAI[],
    preferences: UserPreferences
): string {
    const riskThreshold =
        preferences.riskTolerance === "conservative" ? 25 :
        preferences.riskTolerance === "moderate" ? 40 : 60;

    // Pre-filter pools to reduce prompt size
    const filteredPools = pools
        .filter(p => {
            if (preferences.stablecoinOnly && !p.stablecoin) return false;
            if (preferences.preferredChains.length > 0 && !preferences.preferredChains.includes(p.chain)) return false;
            if (p.apy < preferences.minApy || p.apy > preferences.maxApy) return false;
            if (p.riskScore > riskThreshold + 10) return false; // Some buffer
            return true;
        })
        .slice(0, 30); // Limit to top 30 to manage token usage

    const poolsText = filteredPools.map(p => `
Pool ID: ${p.id}
- Project: ${p.project} (${p.chain})
- Symbol: ${p.symbol}
- APY: ${p.apy.toFixed(2)}% (Base: ${p.apyBase.toFixed(2)}%, Reward: ${p.apyReward.toFixed(2)}%)
- TVL: $${(p.tvlUsd / 1_000_000).toFixed(1)}M
- Risk Score: ${p.riskScore}/100 (${p.riskLevel})
- Stablecoin: ${p.stablecoin ? "Yes" : "No"}
- IL Risk: ${p.ilRisk}
- Liquidity Score: ${p.liquidityRisk.score}/100
- Max Safe Allocation: $${(p.liquidityRisk.maxSafeAllocation / 1_000).toFixed(0)}K
- APY Trend: ${p.apyStability?.trend || "unknown"}
`).join("\n---\n");

    return `You are a DeFi yield analyst. Analyze these yield pools and rank the TOP 5 for this investor.

## Investor Profile
- Risk Tolerance: ${preferences.riskTolerance} (max risk score: ${riskThreshold})
- Preferred Chains: ${preferences.preferredChains.length > 0 ? preferences.preferredChains.join(", ") : "Any"}
- APY Range: ${preferences.minApy}% - ${preferences.maxApy}%
- Stablecoin Focus: ${preferences.stablecoinOnly ? "Yes" : "No"}
${preferences.maxAllocationUsd ? `- Max Allocation: $${preferences.maxAllocationUsd.toLocaleString()}` : ""}

## Available Pools (${filteredPools.length} matching filters)
${poolsText}

## Selection Criteria
For ${preferences.riskTolerance} investors:
${preferences.riskTolerance === "conservative" ?
    "- Prioritize established protocols and stablecoins\n- Risk score should be under 25\n- Base APY (not reward) is more important" :
preferences.riskTolerance === "moderate" ?
    "- Balance risk and reward\n- Risk score ideally under 40\n- Mix of base and reward APY acceptable" :
    "- Higher APY acceptable with higher risk\n- Risk score up to 60 acceptable\n- Growth potential over stability"}

## Task
Select the TOP 5 pools best suited for this investor. Consider:
1. Risk score alignment with tolerance
2. APY sustainability (high reward ratios are riskier)
3. Liquidity for their allocation size
4. Chain preference matching
5. Overall risk-reward balance

Return ONLY valid JSON (no markdown, no explanation):
{
  "rankings": [
    {
      "poolId": "exact-pool-id-from-above",
      "rank": 1,
      "matchScore": 85,
      "reasoning": "One clear sentence why this pool fits.",
      "highlights": ["Key strength 1", "Key strength 2"]
    }
  ],
  "preferenceSummary": "One sentence summary of how recommendations match preferences."
}`;
}
