/**
 * AI-Powered Partnership Matching Engine
 * Analyzes company data to find compatible partners
 */

import { LLMService } from "./cindex/llm";
import type { Company } from "@prisma/client";

export interface PartnershipMatch {
  partnerSlug: string;
  partnerName: string;
  matchScore: number; // 0-100
  compatibility: {
    userOverlap: number; // Estimated user overlap percentage
    technicalFit: number; // 0-100 based on tech stack similarity
    categoryFit: string; // Category compatibility explanation
    synergy: string; // AI-generated synergy description
  };
  projectedImpact: {
    runwayExtension: number; // Estimated months
    userGrowth: number; // Estimated % growth
    revenueOpportunity: number; // Estimated $/month
  };
  partnershipType: string; // 'integration' | 'co-marketing' | 'merger' | 'revenue_share'
  reasoning: string; // AI-generated explanation
}

export class MatchingEngine {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Find top partnership matches for a company
   */
  async findMatches(
    companySlug: string,
    allCompanies: any[],
    limit: number = 10
  ): Promise<PartnershipMatch[]> {
    // Get company data
    const company = allCompanies.find((c) => c.slug === companySlug);

    if (!company) {
      throw new Error("Company not found");
    }

    // Calculate matches with all other companies
    const matches: PartnershipMatch[] = [];

    for (const partner of allCompanies) {
      // Skip self
      if (partner.slug === companySlug) continue;

      const match = await this.calculateMatch(company, partner);
      matches.push(match);
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Return top matches
    return matches.slice(0, limit);
  }

  /**
   * Calculate partnership compatibility between two companies
   */
  private async calculateMatch(
    company: any,
    partner: any
  ): Promise<PartnershipMatch> {
    // 1. Calculate category fit
    const categoryFit = this.calculateCategoryFit(
      company.category,
      partner.category
    );

    // 2. Calculate technical fit (based on chain, tech stack)
    const technicalFit = this.calculateTechnicalFit(company, partner);

    // 3. Estimate user overlap (based on category, size, chain)
    const userOverlap = this.estimateUserOverlap(company, partner);

    // 4. Use AI to generate synergy description
    const aiAnalysis = await this.generateAISynergy(company, partner);

    // 5. Calculate overall match score (weighted average)
    const matchScore = Math.round(
      categoryFit.score * 0.3 +
        technicalFit * 0.2 +
        userOverlap * 0.2 +
        aiAnalysis.synergy_score * 0.3
    );

    // 6. Project partnership impact
    const projectedImpact = this.projectImpact(company, partner, matchScore);

    // 7. Determine partnership type
    const partnershipType = this.determinePartnershipType(company, partner);

    return {
      partnerSlug: partner.slug,
      partnerName: partner.name,
      matchScore,
      compatibility: {
        userOverlap,
        technicalFit,
        categoryFit: categoryFit.explanation,
        synergy: aiAnalysis.synergy_description,
      },
      projectedImpact,
      partnershipType,
      reasoning: aiAnalysis.reasoning,
    };
  }

  /**
   * Calculate category compatibility
   * DeFi + DeFi = high
   * DeFi + NFT = medium
   * Gaming + Gaming = high
   * etc.
   */
  private calculateCategoryFit(
    category1: string,
    category2: string
  ): { score: number; explanation: string } {
    // Same category = high fit
    if (category1 === category2) {
      return {
        score: 90,
        explanation: `Both are ${category1} projects - natural partnership potential`,
      };
    }

    // Cross-category synergies
    const synergies: Record<string, Record<string, number>> = {
      defi: {
        nft: 70, // NFT marketplaces need DEX liquidity
        gaming: 60, // Gaming needs DeFi primitives
        infrastructure: 75, // DeFi needs infrastructure
        dao: 65,
      },
      nft: {
        defi: 70,
        gaming: 85, // NFTs + gaming = strong fit
        infrastructure: 70,
        dao: 60,
      },
      gaming: {
        defi: 60,
        nft: 85,
        infrastructure: 75,
        dao: 55,
      },
      infrastructure: {
        defi: 75,
        nft: 70,
        gaming: 75,
        dao: 70,
      },
      dao: {
        defi: 65,
        nft: 60,
        gaming: 55,
        infrastructure: 70,
      },
    };

    const score = synergies[category1]?.[category2] || 50;

    return {
      score,
      explanation: `${category1} + ${category2} partnership`,
    };
  }

  /**
   * Calculate technical compatibility
   * Same chain = higher fit
   * Similar tech stack = higher fit
   */
  private calculateTechnicalFit(company: any, partner: any): number {
    let score = 50; // Base score

    // Same chain bonus
    const companyData = company.indexData || {};
    const partnerData = partner.indexData || {};

    if (companyData.onchain?.chain === partnerData.onchain?.chain) {
      score += 30;
    }

    // Tech stack similarity (placeholder - would need actual tech stack data)
    // For now, assume some similarity
    score += 20;

    return Math.min(score, 100);
  }

  /**
   * Estimate user overlap percentage
   * Used for calculating cross-sell opportunities
   */
  private estimateUserOverlap(company: any, partner: any): number {
    // This is a simplified estimation
    // In reality, you'd analyze on-chain wallet addresses

    const companyData = company.indexData || {};
    const partnerData = partner.indexData || {};

    const companyUsers = companyData.onchain?.monthlyActiveUsers || 1000;
    const partnerUsers = partnerData.onchain?.monthlyActiveUsers || 1000;

    // Same category = higher overlap
    if (company.category === partner.category) {
      return Math.random() * 15 + 5; // 5-20%
    }

    // Different categories = lower overlap
    return Math.random() * 10 + 2; // 2-12%
  }

  /**
   * Use AI (Gemini) to generate partnership synergy description
   */
  private async generateAISynergy(
    company: any,
    partner: any
  ): Promise<{
    synergy_description: string;
    synergy_score: number;
    reasoning: string;
  }> {
    try {
      const prompt = `Analyze the partnership potential between these two Web3 companies:

Company A: ${company.name}
Category: ${company.category}
Description: ${company.description || "N/A"}

Company B: ${partner.name}
Category: ${partner.category}
Description: ${partner.description || "N/A"}

Provide a brief analysis (2-3 sentences) of:
1. How these companies could partner
2. The synergy potential
3. A compatibility score (0-100)

Format your response as JSON:
{
  "synergy_description": "...",
  "synergy_score": 85,
  "reasoning": "..."
}`;

      // Use Gemini directly
      const model = (this.llmService as any).model;
      if (!model) {
        throw new Error("LLM not available");
      }

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback if AI fails
      return {
        synergy_description: `${company.name} and ${partner.name} could explore partnership opportunities in the ${company.category} space.`,
        synergy_score: 60,
        reasoning: "AI analysis unavailable",
      };
    } catch (error) {
      console.error("AI synergy generation error:", error);

      // Fallback
      return {
        synergy_description: `Potential partnership between ${company.category} companies`,
        synergy_score: 60,
        reasoning: "Automated estimation",
      };
    }
  }

  /**
   * Project partnership impact on runway, users, revenue
   */
  private projectImpact(
    company: any,
    partner: any,
    matchScore: number
  ): {
    runwayExtension: number;
    userGrowth: number;
    revenueOpportunity: number;
  } {
    const companyData = company.indexData || {};
    const partnerData = partner.indexData || {};

    const partnerUsers = partnerData.onchain?.monthlyActiveUsers || 1000;
    const partnerTVL = partnerData.onchain?.tvl || 0;

    // Higher match score = higher impact
    const impactMultiplier = matchScore / 100;

    // User growth: Assume 5-20% of partner's users could convert
    const userGrowth = Math.round((partnerUsers * 0.1 * impactMultiplier) / (companyData.onchain?.monthlyActiveUsers || 1000) * 100);

    // Revenue opportunity: Estimate based on partner size
    const revenueOpportunity = Math.round(
      (partnerTVL * 0.0001 + partnerUsers * 0.5) * impactMultiplier
    );

    // Runway extension: Based on revenue opportunity
    const monthlyBurn = 50000; // Assume $50k/month burn rate
    const runwayExtension = Math.round(
      (revenueOpportunity / monthlyBurn) * 12
    );

    return {
      runwayExtension: Math.min(runwayExtension, 12), // Cap at 12 months
      userGrowth: Math.min(userGrowth, 100), // Cap at 100%
      revenueOpportunity,
    };
  }

  /**
   * Determine best partnership type based on companies
   */
  private determinePartnershipType(company: any, partner: any): string {
    const companySize =
      (company.indexData?.onchain?.monthlyActiveUsers || 0) +
      (company.indexData?.onchain?.tvl || 0) / 1000000;
    const partnerSize =
      (partner.indexData?.onchain?.monthlyActiveUsers || 0) +
      (partner.indexData?.onchain?.tvl || 0) / 1000000;

    // Both small = merger candidate
    if (companySize < 10000 && partnerSize < 10000) {
      return "merger";
    }

    // One large, one small = integration
    if (Math.abs(companySize - partnerSize) > 50000) {
      return "integration";
    }

    // Similar size + same category = co-marketing
    if (company.category === partner.category) {
      return "co-marketing";
    }

    // Default
    return "revenue_share";
  }

  /**
   * Helper method to add AI content generation
   */
  private async generateContent(prompt: string): Promise<string> {
    // This would use the existing LLM service
    // For now, return a placeholder
    return "AI analysis";
  }
}

// Export singleton instance
export const matchingEngine = new MatchingEngine();
