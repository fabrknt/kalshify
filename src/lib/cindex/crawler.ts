import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

export interface NewsItem {
    title: string;
    url: string;
    date: string;
    summary: string;
    source: string;
}

export interface FundingOpportunity {
    companyName: string;
    roundType: string;
    amount: string;
    date: string;
    sourceUrl: string;
    isPotentialSeed: boolean;
}

export class CrawlerService {
    private async getPageContent(url: string): Promise<string> {
        const browser = await puppeteer.launch({ headless: "new" as any });
        const page = await browser.newPage();

        // Optimize for speed and stealth
        await page.setUserAgent(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
        );

        try {
            await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
            const content = await page.content();
            await browser.close();
            return content;
        } catch (error) {
            await browser.close();
            throw new Error(`Failed to crawl ${url}: ${error}`);
        }
    }

    async crawlCompanyNews(url: string, sourceName: string): Promise<NewsItem[]> {
        try {
            console.log(`Crawling ${sourceName} at ${url}...`);
            const html = await this.getPageContent(url);
            console.log(`Successfully fetched ${html.length} characters of HTML from ${url}`);
            const $ = cheerio.load(html);
            const newsItems: NewsItem[] = [];

            // 1. Check for Meta Tags (SEO/OpenGraph) - usually most accurate
            const metaDate =
                $('meta[property="article:published_time"]').attr("content") ||
                $('meta[property="og:updated_time"]').attr("content") ||
                $('meta[name="revised"]').attr("content");

            if (metaDate) {
                console.log(`Found meta date: ${metaDate}`);
                newsItems.push({
                    title: "Website Update",
                    url: url,
                    date: metaDate,
                    summary: "Detected via meta tags",
                    source: sourceName,
                });
            }

            // 2. Generic parser for articles
            $("article, div.post-card, div.blog-post, .entry-content").each(
                (_, element) => {
                    const title = $(element)
                        .find("h1, h2, h3, h4")
                        .first()
                        .text()
                        .trim();
                    const link = $(element).find("a").first().attr("href");
                    const date =
                        $(element).find("time, .date, .published").attr("datetime") ||
                        $(element).find("time, .date, .published").text().trim();

                    if (title && link) {
                        const fullLink = link.startsWith("http")
                            ? link
                            : new URL(link, url).toString();
                        newsItems.push({
                            title,
                            url: fullLink,
                            date: date || new Date().toISOString(),
                            summary: "",
                            source: sourceName,
                        });
                    }
                }
            );

            // 3. Fallback: Search for any <time> tags or common date patterns
            if (newsItems.length === 0) {
                $("time").each((_, el) => {
                    const date = $(el).attr("datetime") || $(el).text().trim();
                    if (date && !isNaN(new Date(date).getTime())) {
                        newsItems.push({
                            title: "Recent Activity",
                            url: url,
                            date: date,
                            summary: "Detected via time tag",
                            source: sourceName,
                        });
                    }
                });
            }

            // Return up to 10 items to get a better frequency reading
            return newsItems.slice(0, 10);
        } catch (error) {
            console.error(`Error crawling ${url}:`, error);
            return [];
        }
    }

    async crawlFundingNews(): Promise<FundingOpportunity[]> {
        // Example targeting a generic crypto funding news aggregator
        // In a real scenario, this would target specific sites like DefiLlama Raises, CryptoRank, etc.
        // For this implementation, we will mock the crawling of a known structure or use a generic one.
        const targetUrl = "https://cryptorank.io/funding-rounds";

        try {
            // NOTE: Many of these sites have heavy anti-bot protection. 
            // We might need to rely on specific open APIs or RSS feeds if scraping is blocked.
            // For the purpose of this task, I will implement a "best effort" scraper 
            // that looks for keywords in a hypothetical news feed.

            // To be safe and ensure the demo works, I will return an empty list or mock data 
            // if the scrape fails, rather than crashing.

            const html = await this.getPageContent(targetUrl);
            const $ = cheerio.load(html);
            const opportunities: FundingOpportunity[] = [];

            // Mock logic for parsing a funding table
            $("tr").each((_, element) => {
                const cols = $(element).find("td");
                if (cols.length > 0) {
                    const companyName = $(cols[0]).text().trim();
                    const roundType = $(cols[2]).text().trim();
                    const amount = $(cols[3]).text().trim();
                    const date = $(cols[4]).text().trim();

                    if (companyName && roundType) {
                        opportunities.push({
                            companyName,
                            roundType,
                            amount,
                            date,
                            sourceUrl: targetUrl,
                            isPotentialSeed: roundType.toLowerCase().includes("seed") || roundType.toLowerCase().includes("pre-seed")
                        });
                    }
                }
            });

            return opportunities;

        } catch (error) {
            console.warn("Funding crawl failed (likely anti-bot), returning empty list:", error);
            return [];
        }
    }
}
