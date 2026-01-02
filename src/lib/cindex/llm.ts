import { GoogleGenerativeAI } from "@google/generative-ai";

export class LLMService {
    private model;

    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set. LLM features will be disabled.");
        } else {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        }
    }

    async summarizePartnerships(title: string, url: string): Promise<string> {
        if (!this.model) return "LLM Summary Unavailable";

        try {
            const prompt = `
            Analyze this news headline and URL for Web3 partnership or integration details.
            
            Headline: "${title}"
            URL: "${url}"
            
            If this news indicates a partnership, integration, or collaboration, provide a 1-sentence summary.
            If it's a generic update or not relevant to partnerships, return "Not a partnership".
            `;

            const result = await this.model.generateContent(prompt);
            const response = result.response;
            return response.text();
        } catch (error) {
            console.error("LLM Summarization failed:", error);
            return "Summary failed";
        }
    }

    async analyzeFundingPotential(companyName: string, roundType: string): Promise<boolean> {
        // Simple heuristic for now, but could use LLM for more complex sentiment analysis 
        // on news snippets if we had full article text.
        return roundType.toLowerCase().includes("seed") || roundType.toLowerCase().includes("pre-seed");
    }
}
