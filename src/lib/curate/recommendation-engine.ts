/**
 * Recommendation Engine
 * Generates personalized DeFi allocations based on user preferences
 */

import { RiskTolerance } from "@/components/curate/quick-start";
import {
    RecommendedAllocation,
    AllocationRecommendation,
    EnhancedReasoning,
} from "@/components/curate/recommendation-display";

// Curated pool data for recommendations
// In production, this would come from the API
interface CuratedPool {
    id: string;
    name: string;
    protocol: string;
    asset: string;
    apy: number;
    riskScore: number;
    riskLevel: "low" | "medium" | "high";
    category: "stablecoin" | "lending" | "lp" | "lst" | "vault";
    minRecommendedAllocation: number;
    maxRecommendedAllocation: number;
    reasoning: string;
    // Enhanced reasoning data
    whyChoose: string;           // Detailed reason for choosing
    riskMitigation: string;      // How risk is managed
    tradeoff: string;            // What you give up
    competitorIds?: string[];    // IDs of alternative pools we considered
    url?: string;                // Link to protocol/pool
}

// Pre-curated pools for recommendations
// These represent the best pools at each risk level
// Expanded for 5-level risk system with enhanced reasoning
const CURATED_POOLS: CuratedPool[] = [
    // === Very Low Risk (Preserver) - Risk Score 0-15 ===
    {
        id: "kamino-usdc-lending",
        name: "USDC Lending",
        protocol: "Kamino",
        asset: "USDC",
        apy: 6.5,
        riskScore: 12,
        riskLevel: "low",
        category: "lending",
        minRecommendedAllocation: 20,
        maxRecommendedAllocation: 60,
        reasoning: "Stable yield from the most liquid stablecoin lending market on Solana",
        whyChoose: "Kamino is the largest lending protocol on Solana with over $1B TVL. USDC lending offers predictable yields from borrowing demand without exposure to crypto price volatility.",
        riskMitigation: "USDC maintains a 1:1 peg to USD. Kamino has been audited multiple times and uses conservative collateral ratios to prevent bad debt.",
        tradeoff: "Lower yields compared to volatile assets or LP positions. Your capital doesn't benefit from potential SOL price appreciation.",
        competitorIds: ["marginfi-usdc", "save-usdc"],
        url: "https://app.kamino.finance/lending",
    },
    {
        id: "marginfi-usdc",
        name: "USDC Supply",
        protocol: "Marginfi",
        asset: "USDC",
        apy: 5.8,
        riskScore: 15,
        riskLevel: "low",
        category: "lending",
        minRecommendedAllocation: 15,
        maxRecommendedAllocation: 50,
        reasoning: "Diversified stablecoin exposure with battle-tested protocol",
        whyChoose: "Marginfi offers competitive USDC yields and has processed billions in volume. Adding marginfi alongside Kamino diversifies your smart contract risk.",
        riskMitigation: "Multiple audits by OtterSec and Neodyme. Conservative liquidation parameters protect lenders from bad debt.",
        tradeoff: "Slightly lower APY than Kamino. Requires managing positions across two protocols.",
        competitorIds: ["kamino-usdc-lending", "save-usdc"],
        url: "https://app.marginfi.com/",
    },
    {
        id: "save-usdc",
        name: "USDC Supply",
        protocol: "Save",
        asset: "USDC",
        apy: 5.5,
        riskScore: 14,
        riskLevel: "low",
        category: "lending",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 40,
        reasoning: "Additional USDC exposure on established Solana lending protocol",
        whyChoose: "Save (formerly Solend) is one of the oldest lending protocols on Solana. Good for additional protocol diversification.",
        riskMitigation: "Battle-tested over multiple market cycles. Conservative risk parameters after learning from past events.",
        tradeoff: "Lower yields than newer competitors. Less active development compared to Kamino/Marginfi.",
        competitorIds: ["kamino-usdc-lending", "marginfi-usdc"],
        url: "https://save.finance/",
    },

    // === Low Risk (Steady) - Risk Score 15-25 ===
    {
        id: "kamino-sol-lending",
        name: "SOL Lending",
        protocol: "Kamino",
        asset: "SOL",
        apy: 5.2,
        riskScore: 18,
        riskLevel: "low",
        category: "lending",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 35,
        reasoning: "Earn yield on SOL with minimal smart contract risk",
        whyChoose: "Lets you hold SOL exposure while earning additional yield from lending demand. Good for those who want to maintain SOL holdings.",
        riskMitigation: "You keep full SOL exposure - no impermanent loss. Kamino's lending is overcollateralized.",
        tradeoff: "SOL price volatility affects your USD value. Lower yields than liquid staking alternatives.",
        competitorIds: ["marinade-msol", "jito-jitosol"],
        url: "https://app.kamino.finance/lending",
    },
    {
        id: "kamino-usdt-lending",
        name: "USDT Lending",
        protocol: "Kamino",
        asset: "USDT",
        apy: 5.5,
        riskScore: 16,
        riskLevel: "low",
        category: "lending",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 30,
        reasoning: "Stablecoin diversification from USDC exposure",
        whyChoose: "USDT often has different yield dynamics than USDC. Diversifying across stablecoins reduces single-issuer risk.",
        riskMitigation: "USDT is the most liquid stablecoin globally. Kamino's lending protects against borrower defaults.",
        tradeoff: "USDT has more centralization risk than USDC. Yields may be lower during low demand periods.",
        competitorIds: ["kamino-usdc-lending"],
        url: "https://app.kamino.finance/lending",
    },
    {
        id: "marinade-msol",
        name: "mSOL Staking",
        protocol: "Marinade",
        asset: "mSOL",
        apy: 7.2,
        riskScore: 20,
        riskLevel: "medium",
        category: "lst",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 35,
        reasoning: "Decentralized liquid staking with validator diversification",
        whyChoose: "Marinade stakes your SOL across 100+ validators, maximizing decentralization. mSOL can be used in DeFi while earning staking rewards.",
        riskMitigation: "Validator diversification reduces slashing risk. mSOL maintains a tight peg to SOL value.",
        tradeoff: "No MEV rewards unlike JitoSOL. Unstaking takes 1-2 epochs unless using instant unstake (small fee).",
        competitorIds: ["jito-jitosol", "sanctum-inf"],
        url: "https://marinade.finance/app/stake/",
    },

    // === Medium Risk (Balanced) - Risk Score 25-35 ===
    {
        id: "jito-jitosol",
        name: "JitoSOL Staking",
        protocol: "Jito",
        asset: "JitoSOL",
        apy: 7.8,
        riskScore: 22,
        riskLevel: "medium",
        category: "lst",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 40,
        reasoning: "Liquid staking with MEV rewards - enhanced SOL yield",
        whyChoose: "JitoSOL captures MEV (maximal extractable value) rewards on top of standard staking yield. This consistently adds 0.5-1% extra APY compared to regular LSTs.",
        riskMitigation: "Jito validators are high-quality and well-monitored. The MEV mechanism is transparent and audited.",
        tradeoff: "More concentrated validator set than Marinade. MEV rewards can vary based on network activity.",
        competitorIds: ["marinade-msol", "sanctum-inf"],
        url: "https://www.jito.network/staking/",
    },
    {
        id: "sanctum-inf",
        name: "INF (Infinity)",
        protocol: "Sanctum",
        asset: "INF",
        apy: 8.5,
        riskScore: 28,
        riskLevel: "medium",
        category: "lst",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 25,
        reasoning: "Diversified LST basket with automatic rebalancing",
        whyChoose: "INF automatically rebalances across multiple LSTs (JitoSOL, mSOL, etc.) to optimize yield. Set-and-forget diversification.",
        riskMitigation: "Diversified across multiple LST protocols. Sanctum handles rebalancing to capture best yields.",
        tradeoff: "Slightly higher smart contract risk due to additional abstraction layer. May not always match the highest-yielding individual LST.",
        competitorIds: ["jito-jitosol", "marinade-msol"],
        url: "https://app.sanctum.so/infinity",
    },
    {
        id: "kamino-jitosol-lending",
        name: "JitoSOL Lending",
        protocol: "Kamino",
        asset: "JitoSOL",
        apy: 4.2,
        riskScore: 25,
        riskLevel: "medium",
        category: "lending",
        minRecommendedAllocation: 10,
        maxRecommendedAllocation: 30,
        reasoning: "Earn additional yield on JitoSOL through lending markets",
        whyChoose: "Stack lending yield on top of JitoSOL's staking rewards. Total yield = staking APY + lending APY.",
        riskMitigation: "JitoSOL maintains peg to SOL. Lending is overcollateralized with conservative LTV ratios.",
        tradeoff: "Lower lending yield than USDC. Your JitoSOL may be borrowed, affecting instant liquidity.",
        competitorIds: ["jito-jitosol"],
        url: "https://app.kamino.finance/lending",
    },

    // === Higher Risk (Growth) - Risk Score 35-50 ===
    {
        id: "drift-usdc-perp",
        name: "USDC Insurance",
        protocol: "Drift",
        asset: "USDC",
        apy: 12.0,
        riskScore: 38,
        riskLevel: "medium",
        category: "vault",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 25,
        reasoning: "Insurance fund yield with perp trading volume exposure",
        whyChoose: "Drift's insurance fund earns from liquidation fees and trading volume. Higher yields than simple lending without crypto price exposure.",
        riskMitigation: "USDC maintains stable value. Insurance fund has first-loss protection mechanisms.",
        tradeoff: "Insurance funds can take losses during extreme volatility events. Yields depend on trading activity.",
        competitorIds: ["kamino-usdc-lending", "jupiter-jlp"],
        url: "https://app.drift.trade/earn",
    },
    {
        id: "jupiter-jlp",
        name: "JLP Vault",
        protocol: "Jupiter",
        asset: "JLP",
        apy: 35.0,
        riskScore: 48,
        riskLevel: "high",
        category: "vault",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 20,
        reasoning: "Perp LP vault with high yields from trading fees and funding",
        whyChoose: "JLP is Jupiter's perp trading counterparty vault. Earns from trader losses, funding rates, and fees. Historically very profitable.",
        riskMitigation: "Jupiter is the largest DEX on Solana. JLP is diversified across SOL, ETH, BTC, and stables.",
        tradeoff: "You're the counterparty to traders - if they win big, JLP loses. Significant exposure to crypto price movements.",
        competitorIds: ["drift-usdc-perp", "meteora-sol-usdc"],
        url: "https://jup.ag/perps-earn",
    },
    {
        id: "meteora-sol-usdc",
        name: "SOL-USDC LP",
        protocol: "Meteora",
        asset: "SOL-USDC",
        apy: 15.5,
        riskScore: 45,
        riskLevel: "high",
        category: "lp",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 30,
        reasoning: "High yield from the most liquid trading pair, with IL risk",
        whyChoose: "SOL-USDC is the highest volume pair on Solana. LP fees can be substantial during high volatility periods.",
        riskMitigation: "Most liquid pair means easy entry/exit. Meteora's dynamic fees help offset IL during volatility.",
        tradeoff: "Impermanent loss when SOL price moves significantly. LP yields can drop during low-volume periods.",
        competitorIds: ["orca-sol-usdc-clmm", "raydium-sol-usdc-clmm"],
        url: "https://app.meteora.ag/pools",
    },

    // === High Risk (Maximizer) - Risk Score 50+ ===
    {
        id: "orca-sol-usdc-clmm",
        name: "SOL-USDC CLMM",
        protocol: "Orca",
        asset: "SOL-USDC",
        apy: 22.0,
        riskScore: 55,
        riskLevel: "high",
        category: "lp",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 25,
        reasoning: "Concentrated liquidity for higher yields, requires active management",
        whyChoose: "Concentrated liquidity amplifies your fee earnings within a price range. Can earn 2-3x regular LP yields when managed well.",
        riskMitigation: "Orca is a battle-tested AMM. Wide price ranges reduce rebalancing frequency.",
        tradeoff: "Requires active management - your liquidity goes out of range if price moves. Higher IL than standard AMM.",
        competitorIds: ["meteora-sol-usdc", "raydium-sol-usdc-clmm"],
        url: "https://www.orca.so/pools",
    },
    {
        id: "raydium-sol-usdc-clmm",
        name: "SOL-USDC CLMM",
        protocol: "Raydium",
        asset: "SOL-USDC",
        apy: 28.0,
        riskScore: 58,
        riskLevel: "high",
        category: "lp",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 20,
        reasoning: "High-yield concentrated liquidity on Raydium",
        whyChoose: "Raydium's CLMM often has higher volume than Orca for certain pairs. Can capture more fees during high activity.",
        riskMitigation: "Raydium is established infrastructure on Solana. Multiple audits completed.",
        tradeoff: "Same CLMM risks as Orca - requires active management and has amplified IL. Interface is less user-friendly.",
        competitorIds: ["orca-sol-usdc-clmm", "meteora-sol-usdc"],
        url: "https://raydium.io/clmm/pools/",
    },
    {
        id: "kamino-multiply-sol",
        name: "SOL Multiply",
        protocol: "Kamino",
        asset: "SOL",
        apy: 18.0,
        riskScore: 52,
        riskLevel: "high",
        category: "vault",
        minRecommendedAllocation: 5,
        maxRecommendedAllocation: 20,
        reasoning: "Leveraged SOL staking strategy for amplified returns",
        whyChoose: "Kamino Multiply loops SOL staking to amplify yields. Automated leverage management handles rebalancing.",
        riskMitigation: "Kamino's vaults auto-deleverage during high volatility. Multiple audits on the leverage mechanism.",
        tradeoff: "Leverage amplifies both gains and losses. Can face liquidation during rapid SOL price drops.",
        competitorIds: ["jito-jitosol", "jupiter-jlp"],
        url: "https://app.kamino.finance/liquidity/multiply",
    },
    {
        id: "meteora-dlmm-sol-usdc",
        name: "SOL-USDC DLMM",
        protocol: "Meteora",
        asset: "SOL-USDC",
        apy: 45.0,
        riskScore: 65,
        riskLevel: "high",
        category: "lp",
        minRecommendedAllocation: 3,
        maxRecommendedAllocation: 15,
        reasoning: "Dynamic liquidity market making - highest yields, requires monitoring",
        whyChoose: "DLMM pools offer the highest yields on Solana through dynamic fee adjustment and tight liquidity provision.",
        riskMitigation: "Meteora's DLMM has built-in fee optimization. Can set wider bins to reduce management needs.",
        tradeoff: "Highest complexity and management requirements. IL can be severe if not actively monitored.",
        competitorIds: ["orca-sol-usdc-clmm", "raydium-sol-usdc-clmm"],
        url: "https://app.meteora.ag/dlmm",
    },
];

// Allocation templates for each risk profile (5-level system)
interface AllocationTemplate {
    riskTolerance: RiskTolerance;
    targetRiskScore: number;
    maxRiskScore: number;
    stablecoinMin: number;
    stablecoinMax: number;
    lstMax: number;
    lpMax: number;
    vaultMax: number;
    poolCount: number;
    description: string;
}

const ALLOCATION_TEMPLATES: AllocationTemplate[] = [
    {
        riskTolerance: "preserver",
        targetRiskScore: 12,
        maxRiskScore: 18,
        stablecoinMin: 70,
        stablecoinMax: 90,
        lstMax: 20,
        lpMax: 0,
        vaultMax: 0,
        poolCount: 3,
        description: "Capital protection first - minimal risk exposure",
    },
    {
        riskTolerance: "steady",
        targetRiskScore: 18,
        maxRiskScore: 25,
        stablecoinMin: 50,
        stablecoinMax: 70,
        lstMax: 35,
        lpMax: 0,
        vaultMax: 0,
        poolCount: 3,
        description: "Stable growth with minimal volatility",
    },
    {
        riskTolerance: "balanced",
        targetRiskScore: 28,
        maxRiskScore: 38,
        stablecoinMin: 30,
        stablecoinMax: 50,
        lstMax: 45,
        lpMax: 15,
        vaultMax: 15,
        poolCount: 4,
        description: "Mix of stability and growth opportunities",
    },
    {
        riskTolerance: "growth",
        targetRiskScore: 40,
        maxRiskScore: 52,
        stablecoinMin: 15,
        stablecoinMax: 35,
        lstMax: 40,
        lpMax: 30,
        vaultMax: 25,
        poolCount: 5,
        description: "Accepts volatility for higher returns",
    },
    {
        riskTolerance: "maximizer",
        targetRiskScore: 55,
        maxRiskScore: 70,
        stablecoinMin: 5,
        stablecoinMax: 20,
        lstMax: 35,
        lpMax: 45,
        vaultMax: 35,
        poolCount: 5,
        description: "Maximum yield pursuit with highest risk",
    },
];

/**
 * Generate enhanced reasoning for a pool allocation
 */
function generateEnhancedReasoning(
    pool: CuratedPool,
    allocation: number,
    riskTolerance: RiskTolerance,
    allPools: CuratedPool[]
): EnhancedReasoning {
    // Get alternatives from competitorIds
    const alternatives = (pool.competitorIds || [])
        .map(id => allPools.find(p => p.id === id))
        .filter((p): p is CuratedPool => p !== undefined)
        .slice(0, 2) // Max 2 alternatives
        .map(alt => ({
            pool: alt.name,
            protocol: alt.protocol,
            whyNot: generateWhyNot(pool, alt, riskTolerance),
        }));

    // Generate percentage reasoning based on context
    const percentageReasoning = generatePercentageReasoning(pool, allocation, riskTolerance);

    return {
        whyThisPool: pool.whyChoose,
        whyThisPercentage: percentageReasoning,
        alternativesConsidered: alternatives,
        riskMitigation: pool.riskMitigation,
        tradeoff: pool.tradeoff,
    };
}

/**
 * Generate explanation for why an alternative wasn't chosen
 */
function generateWhyNot(chosen: CuratedPool, alternative: CuratedPool, riskTolerance: RiskTolerance): string {
    const riskDiff = alternative.riskScore - chosen.riskScore;
    const apyDiff = alternative.apy - chosen.apy;

    // If alternative has higher risk
    if (riskDiff > 5) {
        if (["preserver", "steady"].includes(riskTolerance)) {
            return `Higher risk (${alternative.riskScore} vs ${chosen.riskScore}) - exceeds your ${riskTolerance} profile`;
        }
        return `Higher risk score (${alternative.riskScore}) without proportional yield benefit`;
    }

    // If alternative has lower APY
    if (apyDiff < -0.5) {
        return `Lower yield (${alternative.apy.toFixed(1)}% vs ${chosen.apy.toFixed(1)}%) for similar risk`;
    }

    // If it's a different protocol for diversification
    if (chosen.protocol !== alternative.protocol) {
        return `${chosen.protocol} chosen for protocol diversification`;
    }

    // Default
    return `${chosen.name} offers better risk-adjusted returns`;
}

/**
 * Generate explanation for allocation percentage
 */
function generatePercentageReasoning(pool: CuratedPool, allocation: number, riskTolerance: RiskTolerance): string {
    const isStablecoin = pool.category === "lending" && (pool.asset === "USDC" || pool.asset === "USDT");
    const isLST = pool.category === "lst";
    const isLP = pool.category === "lp";
    const isVault = pool.category === "vault";

    if (isStablecoin) {
        if (allocation >= 40) {
            return `${allocation}% provides a strong defensive anchor for your ${riskTolerance} profile. Stablecoins protect against crypto volatility while generating consistent yield.`;
        }
        return `${allocation}% balances stability with growth opportunities. Enough to provide a safety buffer without over-concentrating in lower yields.`;
    }

    if (isLST) {
        if (allocation >= 30) {
            return `${allocation}% gives meaningful SOL exposure with staking rewards. LSTs are your primary growth engine while maintaining liquidity.`;
        }
        return `${allocation}% adds SOL exposure without overconcentration. Diversifying across LST and other positions manages single-asset risk.`;
    }

    if (isLP) {
        if (allocation >= 20) {
            return `${allocation}% captures LP fees from high-volume pairs. This allocation accepts IL risk for significantly higher yield potential.`;
        }
        return `${allocation}% provides LP exposure while limiting IL impact on your total portfolio. A smaller position means IL affects overall returns less.`;
    }

    if (isVault) {
        return `${allocation}% adds vault strategy exposure. These automated strategies can generate higher yields through mechanisms like leverage or insurance provision.`;
    }

    return `${allocation}% based on optimal risk-adjusted allocation for ${riskTolerance} profile.`;
}

/**
 * Generate a personalized allocation recommendation
 * Updated for 5-level risk system
 */
export function generateRecommendation(
    amount: number,
    riskTolerance: RiskTolerance
): AllocationRecommendation {
    const template = ALLOCATION_TEMPLATES.find(t => t.riskTolerance === riskTolerance)!;

    // Filter pools by risk tolerance (based on maxRiskScore)
    const eligiblePools = CURATED_POOLS.filter(pool => pool.riskScore <= template.maxRiskScore);

    // Build allocation based on template
    const allocations: RecommendedAllocation[] = [];
    let remainingAllocation = 100;

    // Helper to add pool with enhanced reasoning
    const addPool = (pool: CuratedPool, targetAllocation: number) => {
        const allocation = Math.min(targetAllocation, remainingAllocation);
        if (allocation <= 0) return;

        const enhancedReasoning = generateEnhancedReasoning(
            pool,
            allocation,
            riskTolerance,
            CURATED_POOLS
        );

        allocations.push({
            poolId: pool.id,
            poolName: pool.name,
            protocol: pool.protocol,
            asset: pool.asset,
            allocation,
            apy: pool.apy,
            riskLevel: pool.riskLevel,
            riskScore: pool.riskScore,
            reasoning: pool.reasoning,
            enhancedReasoning,
            url: pool.url,
        });
        remainingAllocation -= allocation;
    };

    // 1. Stablecoin anchor - varies by risk level
    const stablecoinPools = eligiblePools
        .filter(p => p.category === "lending" && (p.asset === "USDC" || p.asset === "USDT"))
        .sort((a, b) => a.riskScore - b.riskScore);

    // Primary stablecoin allocation
    const primaryStableAlloc = {
        preserver: 55,
        steady: 45,
        balanced: 30,
        growth: 20,
        maximizer: 10,
    }[riskTolerance];

    if (stablecoinPools.length > 0) {
        addPool(stablecoinPools[0], primaryStableAlloc);
    }

    // Secondary stablecoin for diversification (lower risk profiles)
    if (["preserver", "steady", "balanced"].includes(riskTolerance) && stablecoinPools.length > 1) {
        const secondaryStableAlloc = riskTolerance === "preserver" ? 25 : riskTolerance === "steady" ? 15 : 10;
        addPool(stablecoinPools[1], secondaryStableAlloc);
    }

    // 2. SOL exposure - lending for conservative, LST for others
    const solLending = eligiblePools.find(p => p.category === "lending" && p.asset === "SOL");
    const lstPools = eligiblePools
        .filter(p => p.category === "lst")
        .sort((a, b) => a.riskScore - b.riskScore);

    if (riskTolerance === "preserver") {
        // Preserver: only SOL lending, no LST
        if (solLending) {
            addPool(solLending, 20);
        }
    } else if (riskTolerance === "steady") {
        // Steady: primarily mSOL (lowest risk LST)
        if (lstPools.length > 0) {
            addPool(lstPools[0], 30);
        }
        // Add SOL lending for additional stability
        if (solLending && remainingAllocation > 10) {
            addPool(solLending, 10);
        }
    } else {
        // Balanced/Growth/Maximizer: JitoSOL and other LSTs
        const jitoPool = lstPools.find(p => p.asset === "JitoSOL");
        const otherLst = lstPools.find(p => p.asset !== "JitoSOL");

        if (jitoPool) {
            const jitoAlloc = riskTolerance === "balanced" ? 25 : riskTolerance === "growth" ? 20 : 15;
            addPool(jitoPool, jitoAlloc);
        }
        if (otherLst && riskTolerance !== "maximizer") {
            addPool(otherLst, 15);
        }
    }

    // 3. Vault exposure for balanced+
    if (["balanced", "growth", "maximizer"].includes(riskTolerance)) {
        const vaultPools = eligiblePools
            .filter(p => p.category === "vault")
            .sort((a, b) => a.riskScore - b.riskScore);

        if (vaultPools.length > 0) {
            const vaultAlloc = riskTolerance === "balanced" ? 15 : riskTolerance === "growth" ? 20 : 25;
            addPool(vaultPools[0], vaultAlloc);
        }
    }

    // 4. LP exposure for growth+
    if (["growth", "maximizer"].includes(riskTolerance)) {
        const lpPools = eligiblePools
            .filter(p => p.category === "lp")
            .sort((a, b) => a.riskScore - b.riskScore);

        if (lpPools.length > 0) {
            const lpAlloc = riskTolerance === "growth" ? 20 : 30;
            addPool(lpPools[0], lpAlloc);

            // Maximizer gets a second LP position
            if (riskTolerance === "maximizer" && lpPools.length > 1 && remainingAllocation > 10) {
                addPool(lpPools[1], 15);
            }
        }
    }

    // 5. Distribute any remaining allocation
    if (remainingAllocation > 0 && allocations.length > 0) {
        // For conservative profiles, add to stablecoin
        // For aggressive profiles, add to highest-yield position
        if (["preserver", "steady"].includes(riskTolerance)) {
            allocations[0].allocation += remainingAllocation;
        } else {
            // Find highest APY position and add there
            const highestApy = allocations.reduce((max, a) =>
                a.apy > max.apy ? a : max, allocations[0]);
            highestApy.allocation += remainingAllocation;
        }
    }

    // Calculate summary metrics
    const weightedApy = allocations.reduce(
        (sum, a) => sum + (a.apy * a.allocation / 100),
        0
    );
    const weightedRisk = allocations.reduce(
        (sum, a) => sum + (a.riskScore * a.allocation / 100),
        0
    );
    const expectedYield = amount * weightedApy / 100;

    // Determine overall risk level
    const overallRisk: "low" | "medium" | "high" =
        weightedRisk <= 20 ? "low" :
        weightedRisk <= 40 ? "medium" : "high";

    // Calculate diversification score
    const protocolCount = new Set(allocations.map(a => a.protocol)).size;
    const categoryCount = new Set(
        allocations.map(a =>
            CURATED_POOLS.find(p => p.id === a.poolId)?.category
        )
    ).size;
    const diversificationScore = Math.min(100,
        (protocolCount * 15) + (categoryCount * 20) + (allocations.length * 10)
    );

    // Generate insights
    const insights: string[] = [];
    const stablecoinPercent = allocations
        .filter(a => a.asset === "USDC" || a.asset === "USDT")
        .reduce((sum, a) => sum + a.allocation, 0);

    if (stablecoinPercent >= 50) {
        insights.push(`${stablecoinPercent}% in stablecoins provides a defensive anchor for your portfolio`);
    }

    if (protocolCount >= 3) {
        insights.push(`Spread across ${protocolCount} protocols for smart contract risk diversification`);
    }

    const lstPercent = allocations
        .filter(a => CURATED_POOLS.find(p => p.id === a.poolId)?.category === "lst")
        .reduce((sum, a) => sum + a.allocation, 0);
    if (lstPercent > 0) {
        insights.push(`${lstPercent}% in liquid staking earns staking rewards plus lending yield`);
    }

    insights.push(`Expected ${weightedApy.toFixed(1)}% APY is ${
        weightedApy > 10 ? "above" : "at"
    } market average for this risk level`);

    // Generate warnings
    const warnings: string[] = [];

    if (riskTolerance === "growth" || riskTolerance === "maximizer") {
        warnings.push("Higher yields come with higher risk - only invest what you can afford to lose");
    }

    const lpPercent = allocations
        .filter(a => CURATED_POOLS.find(p => p.id === a.poolId)?.category === "lp")
        .reduce((sum, a) => sum + a.allocation, 0);
    if (lpPercent > 0) {
        warnings.push(`LP positions (${lpPercent}%) are subject to impermanent loss if prices diverge`);
    }

    if (amount >= 100000) {
        warnings.push("For large amounts, consider splitting deposits across multiple transactions");
    }

    warnings.push("Past performance doesn't guarantee future results - yields can change");
    warnings.push("This is educational content, not financial advice - DYOR");

    return {
        allocations,
        summary: {
            totalAmount: amount,
            expectedApy: weightedApy,
            expectedYield,
            overallRisk,
            diversificationScore,
        },
        insights,
        warnings,
    };
}

/**
 * Get a quick recommendation summary for a given risk level
 * Updated for 5-level system
 */
export function getRecommendationPreview(riskTolerance: RiskTolerance): {
    expectedApy: string;
    poolCount: number;
    riskLevel: string;
} {
    const template = ALLOCATION_TEMPLATES.find(t => t.riskTolerance === riskTolerance)!;

    const apyRanges: Record<RiskTolerance, string> = {
        preserver: "4-6%",
        steady: "6-8%",
        balanced: "8-12%",
        growth: "12-18%",
        maximizer: "18%+",
    };

    const riskLabels: Record<RiskTolerance, string> = {
        preserver: "Very Low",
        steady: "Low",
        balanced: "Medium",
        growth: "Higher",
        maximizer: "High",
    };

    return {
        expectedApy: apyRanges[riskTolerance],
        poolCount: template.poolCount,
        riskLevel: riskLabels[riskTolerance],
    };
}

/**
 * Map legacy risk tolerance values to new 5-level system
 */
export function mapLegacyRiskTolerance(legacy: string): RiskTolerance {
    const map: Record<string, RiskTolerance> = {
        conservative: "preserver",
        moderate: "balanced",
        aggressive: "maximizer",
    };
    return map[legacy] || (legacy as RiskTolerance);
}
