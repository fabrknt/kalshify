import Anthropic from "@anthropic-ai/sdk";
import {
    UserPreferences,
    RecommendationsResult,
    PoolInsight,
    PortfolioRequest,
    PortfolioResult,
    PoolForAI,
} from "./types";
import { buildRecommendationsPrompt } from "./prompts/recommendations";
import { buildInsightsPrompt } from "./prompts/insights";
import { buildPortfolioPrompt } from "./prompts/portfolio";

export class YieldAdvisorService {
    private client: Anthropic | null = null;

    constructor() {
        if (!process.env.ANTHROPIC_API_KEY) {
            console.warn("ANTHROPIC_API_KEY not set. AI features disabled.");
        } else {
            this.client = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }
    }

    isAvailable(): boolean {
        return this.client !== null;
    }

    async getPersonalizedRecommendations(
        pools: PoolForAI[],
        preferences: UserPreferences
    ): Promise<RecommendationsResult> {
        if (!this.client) {
            throw new Error("AI service unavailable - ANTHROPIC_API_KEY not set");
        }

        const prompt = buildRecommendationsPrompt(pools, preferences);

        const message = await this.client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const content = message.content[0];
        if (content.type !== "text") {
            throw new Error("Unexpected response type from AI");
        }

        try {
            const result = JSON.parse(content.text);
            return {
                recommendations: result.rankings || [],
                preferenceSummary: result.preferenceSummary || "",
            };
        } catch {
            throw new Error("Failed to parse AI response");
        }
    }

    async getPoolInsight(
        pool: PoolForAI,
        similarPools: PoolForAI[],
        historicalData?: { date: string; apy: number }[]
    ): Promise<PoolInsight> {
        if (!this.client) {
            throw new Error("AI service unavailable - ANTHROPIC_API_KEY not set");
        }

        const prompt = buildInsightsPrompt(pool, similarPools, historicalData);

        const message = await this.client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        });

        const content = message.content[0];
        if (content.type !== "text") {
            throw new Error("Unexpected response type from AI");
        }

        try {
            return JSON.parse(content.text) as PoolInsight;
        } catch {
            throw new Error("Failed to parse AI response");
        }
    }

    async optimizePortfolio(
        pools: PoolForAI[],
        request: PortfolioRequest
    ): Promise<PortfolioResult> {
        if (!this.client) {
            throw new Error("AI service unavailable - ANTHROPIC_API_KEY not set");
        }

        const prompt = buildPortfolioPrompt(pools, request);

        const message = await this.client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1536,
            messages: [{ role: "user", content: prompt }],
        });

        const content = message.content[0];
        if (content.type !== "text") {
            throw new Error("Unexpected response type from AI");
        }

        try {
            return JSON.parse(content.text) as PortfolioResult;
        } catch {
            throw new Error("Failed to parse AI response");
        }
    }
}

// Singleton instance
let instance: YieldAdvisorService | null = null;

export function getYieldAdvisor(): YieldAdvisorService {
    if (!instance) {
        instance = new YieldAdvisorService();
    }
    return instance;
}
