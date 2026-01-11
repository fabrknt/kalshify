import Anthropic from "@anthropic-ai/sdk";

export class LLMService {
    private client: Anthropic | null = null;

    constructor() {
        if (!process.env.ANTHROPIC_API_KEY) {
            console.warn("ANTHROPIC_API_KEY is not set. LLM features will be disabled.");
        } else {
            this.client = new Anthropic({
                apiKey: process.env.ANTHROPIC_API_KEY,
            });
        }
    }

    async summarizePartnerships(title: string, url: string): Promise<string> {
        if (!this.client) return "LLM Summary Unavailable";

        try {
            const message = await this.client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 256,
                messages: [
                    {
                        role: "user",
                        content: `Analyze this news headline and URL for Web3 partnership or integration details.

Headline: "${title}"
URL: "${url}"

If this news indicates a partnership, integration, or collaboration, provide a 1-sentence summary.
If it's a generic update or not relevant to partnerships, return "Not a partnership".`,
                    },
                ],
            });

            const textBlock = message.content.find((block) => block.type === "text");
            return textBlock ? textBlock.text : "Summary unavailable";
        } catch (error) {
            console.error("LLM Summarization failed:", error);
            return "Summary failed";
        }
    }

    async analyzeFundingPotential(companyName: string, roundType: string): Promise<boolean> {
        return roundType.toLowerCase().includes("seed") || roundType.toLowerCase().includes("pre-seed");
    }

    /**
     * Analyze partnership quality with AI context understanding
     */
    async analyzePartnershipQuality(newsItem: {
        title: string;
        content?: string;
        url?: string;
    }): Promise<{
        isPartnership: boolean;
        quality: "tier1" | "tier2" | "tier3" | "none";
        partnerNames: string[];
        relationshipType: "integration" | "collaboration" | "investment" | "grant" | "other";
        confidence: number;
        reasoning: string;
    }> {
        if (!this.client) {
            const title = newsItem.title.toLowerCase();
            const hasKeyword = /\b(partner|integration|collaboration)\b/i.test(title);
            return {
                isPartnership: hasKeyword,
                quality: hasKeyword ? "tier3" : "none",
                partnerNames: [],
                relationshipType: "other",
                confidence: hasKeyword ? 50 : 0,
                reasoning: "LLM unavailable, using basic keyword detection",
            };
        }

        try {
            const message = await this.client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 512,
                messages: [
                    {
                        role: "user",
                        content: `Analyze this announcement for partnership/integration signals in the Web3 space.

Title: "${newsItem.title}"
${newsItem.content ? `Content: "${newsItem.content.slice(0, 500)}..."` : ""}
${newsItem.url ? `URL: ${newsItem.url}` : ""}

Determine:
1. Is this a REAL partnership/integration? (not just mentioning another company)
2. Quality tier based on partner prominence:
   - tier1: Major companies (Coinbase, Binance, Circle, Alchemy, a16z, etc.)
   - tier2: Established protocols (Uniswap, Aave, Chainlink, etc.)
   - tier3: Smaller partners
   - none: Not a partnership
3. Partner names
4. Relationship type: integration | collaboration | investment | grant | other
5. Confidence (0-100)

Return ONLY valid JSON:
{
  "isPartnership": true/false,
  "quality": "tier1" | "tier2" | "tier3" | "none",
  "partnerNames": ["Company1"],
  "relationshipType": "integration" | "collaboration" | "investment" | "grant" | "other",
  "confidence": 0-100,
  "reasoning": "Brief explanation"
}`,
                    },
                ],
            });

            const textBlock = message.content.find((block) => block.type === "text");
            if (!textBlock) throw new Error("No text response from Claude");

            const cleanedResponse = textBlock.text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            const analysis = JSON.parse(cleanedResponse);

            if (
                typeof analysis.isPartnership !== "boolean" ||
                !["tier1", "tier2", "tier3", "none"].includes(analysis.quality) ||
                !Array.isArray(analysis.partnerNames) ||
                typeof analysis.confidence !== "number"
            ) {
                throw new Error("Invalid response structure from LLM");
            }

            return analysis;
        } catch (error) {
            console.error("Partnership analysis failed:", error);
            const title = newsItem.title.toLowerCase();
            const hasKeyword = /\b(partnership|integration|collaborat|partner with)\b/i.test(title);

            return {
                isPartnership: hasKeyword,
                quality: hasKeyword ? "tier3" : "none",
                partnerNames: [],
                relationshipType: "other",
                confidence: hasKeyword ? 40 : 0,
                reasoning: "Fallback to keyword detection due to LLM error",
            };
        }
    }

    /**
     * Batch analyze multiple news items for partnerships
     */
    async batchAnalyzePartnerships(
        newsItems: Array<{ title: string; content?: string; url?: string }>
    ): Promise<
        Array<{
            isPartnership: boolean;
            quality: "tier1" | "tier2" | "tier3" | "none";
            partnerNames: string[];
            relationshipType: string;
            confidence: number;
            reasoning: string;
        }>
    > {
        if (!this.client || newsItems.length === 0) {
            return newsItems.map(() => ({
                isPartnership: false,
                quality: "none" as const,
                partnerNames: [],
                relationshipType: "other",
                confidence: 0,
                reasoning: "LLM unavailable or no items",
            }));
        }

        try {
            const message = await this.client.messages.create({
                model: "claude-sonnet-4-20250514",
                max_tokens: 2048,
                messages: [
                    {
                        role: "user",
                        content: `Analyze these ${newsItems.length} news announcements for partnership signals.

${newsItems
    .map(
        (item, i) => `News ${i + 1}:
Title: "${item.title}"
${item.content ? `Content: "${item.content.slice(0, 300)}..."` : ""}`
    )
    .join("\n\n")}

Quality tiers:
- tier1: Major companies (Coinbase, Binance, Circle, Alchemy, a16z, etc.)
- tier2: Established protocols (Uniswap, Aave, Chainlink, etc.)
- tier3: Smaller partners
- none: Not a partnership

Return ONLY a JSON array:
[
  {
    "isPartnership": true/false,
    "quality": "tier1" | "tier2" | "tier3" | "none",
    "partnerNames": ["Company"],
    "relationshipType": "integration" | "collaboration" | "investment" | "grant" | "other",
    "confidence": 0-100,
    "reasoning": "Brief explanation"
  }
]`,
                    },
                ],
            });

            const textBlock = message.content.find((block) => block.type === "text");
            if (!textBlock) throw new Error("No text response from Claude");

            const cleanedResponse = textBlock.text
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();

            const analyses = JSON.parse(cleanedResponse);

            if (!Array.isArray(analyses) || analyses.length !== newsItems.length) {
                throw new Error("Invalid batch response from LLM");
            }

            return analyses;
        } catch (error) {
            console.error("Batch partnership analysis failed:", error);
            return Promise.all(newsItems.map((item) => this.analyzePartnershipQuality(item)));
        }
    }
}
