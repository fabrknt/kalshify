/**
 * Calculate scores for companies based on raw data
 * Uses category-aware scoring logic
 * Usage: npx tsx scripts/calculate-scores.ts
 */

import fs from "fs";
import path from "path";

const DATA_DIR = "data/companies";
const OUTPUT_DIR = "data/scored-companies";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

interface RawCompanyData {
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string | null;
  logo: string | null;
  indexData: {
    github: {
      totalStars: number | null;
      totalForks: number | null;
      totalCommits30d: number | null;
      activeContributors30d: number | null;
      totalContributors: number | null;
      lastCommitDate: string | null;
      repoCount: number | null;
      fetchStatus: string;
      fetchError: string | null;
    };
    twitter: {
      followers: number | null;
      following: number | null;
      tweetCount: number | null;
      accountCreatedAt: string | null;
      fetchStatus: string;
      fetchError: string | null;
    };
    social: {
      twitterFollowers: number | null;
    };
    onchain: {
      chain: string;
      contractAddress: string | null;
      tokenAddress: string | null;
      tvl: number | null;
      tokenPrice: number | null;
      marketCap: number | null;
      holderCount: number | null;
      txCount24h: number | null;
      activeUsers24h: number | null;
      fetchStatus: string;
      fetchError: string | null;
    };
    metadata: {
      fetchedAt: string;
      dataSource: string;
    };
  };
  isActive: boolean;
  isListed: boolean;
}

interface Scores {
  overallScore: number;
  teamHealthScore: number;
  communityScore: number;
  adoptionScore: number;
  trend: "up" | "down" | "stable";
  confidence: number; // 0-100, how confident we are in the score based on available data
}

/**
 * Normalize a value to 0-100 scale using sigmoid function
 * Prevents scores from hitting 100 too easily
 */
function normalize(value: number, midpoint: number, steepness: number = 0.1): number {
  // Sigmoid: 100 / (1 + e^(-steepness * (value - midpoint)))
  return Math.round(100 / (1 + Math.exp(-steepness * (value - midpoint))));
}

/**
 * Calculate team health score based on GitHub activity
 */
function calculateTeamHealth(github: RawCompanyData['indexData']['github']): { score: number; confidence: number } {
  if (github.fetchStatus !== 'success') {
    return { score: 0, confidence: 0 };
  }

  const commits = github.totalCommits30d ?? 0;
  const contributors = github.activeContributors30d ?? 0;
  const stars = github.totalStars ?? 0;
  const repos = github.repoCount ?? 0;

  // Infrastructure/dev tool projects: weight stars and contributor diversity
  // DeFi projects: weight recent activity (commits)

  // Normalized scoring (prevents easy 100s)
  const commitScore = normalize(commits, 50, 0.05); // 50 commits/month is "average"
  const contributorScore = normalize(contributors, 10, 0.2); // 10 contributors is "good"
  const starScore = normalize(stars, 500, 0.002); // 500 stars is "good"
  const repoScore = normalize(repos, 20, 0.1); // 20 repos is "average"

  // Weighted average
  const score = Math.round(
    commitScore * 0.35 +
    contributorScore * 0.35 +
    starScore * 0.2 +
    repoScore * 0.1
  );

  // Confidence based on data freshness and completeness
  let confidence = 100;
  if (github.totalCommits30d === null) confidence -= 30;
  if (github.activeContributors30d === null) confidence -= 30;
  if (github.totalStars === null) confidence -= 20;

  return { score, confidence };
}

/**
 * Calculate community score based on social metrics
 */
function calculateCommunity(twitter: RawCompanyData['indexData']['twitter']): { score: number; confidence: number } {
  if (twitter.fetchStatus !== 'success') {
    return { score: 0, confidence: 0 };
  }

  const followers = twitter.followers ?? 0;
  const tweets = twitter.tweetCount ?? 0;
  const following = twitter.following ?? 0;

  // Engagement ratio: followers / following (higher is better)
  const engagementRatio = following > 0 ? followers / following : followers;

  const followerScore = normalize(followers, 10000, 0.0001); // 10k followers is "good"
  const tweetScore = normalize(tweets, 1000, 0.002); // 1k tweets shows activity
  const engagementScore = normalize(engagementRatio, 5, 0.3); // 5x ratio is healthy

  const score = Math.round(
    followerScore * 0.5 +
    tweetScore * 0.2 +
    engagementScore * 0.3
  );

  return { score, confidence: 100 };
}

/**
 * Calculate adoption score based on on-chain metrics
 * Category-aware: Infrastructure projects get a pass on low on-chain activity
 */
function calculateAdoption(
  onchain: RawCompanyData['indexData']['onchain'],
  category: string
): { score: number; confidence: number } {
  // Infrastructure projects (RPC, indexers, dev tools) don't need on-chain metrics
  const infraCategories = ['infra', 'infrastructure', 'dev-tools', 'developer-tools'];
  if (infraCategories.includes(category.toLowerCase())) {
    // For infra, use GitHub stars as a proxy for adoption
    return { score: 0, confidence: 0 }; // Will be ignored in final score
  }

  if (onchain.fetchStatus === 'failed') {
    return { score: 0, confidence: 0 };
  }

  const tvl = onchain.tvl ?? 0;
  const txCount = onchain.txCount24h ?? 0;
  const activeUsers = onchain.activeUsers24h ?? 0;
  const marketCap = onchain.marketCap ?? 0;

  // Different metrics matter for different categories
  let score = 0;
  let confidence = 0;

  if (category === 'defi') {
    // DeFi: TVL and active users are critical
    const tvlScore = normalize(tvl, 1000000, 0.000001); // $1M TVL is "good"
    const txScore = normalize(txCount, 100, 0.02); // 100 tx/day is active
    const userScore = normalize(activeUsers, 50, 0.05); // 50 users/day is healthy

    score = Math.round(
      tvlScore * 0.5 +
      userScore * 0.3 +
      txScore * 0.2
    );

    confidence = onchain.tvl !== null ? 80 : 40;
  } else if (category === 'nft' || category === 'gaming') {
    // NFT/Gaming: Active users and transaction volume
    const txScore = normalize(txCount, 500, 0.005); // More tx expected
    const userScore = normalize(activeUsers, 200, 0.01); // More users expected

    score = Math.round(
      userScore * 0.6 +
      txScore * 0.4
    );

    confidence = activeUsers !== null ? 70 : 30;
  } else {
    // General: Use all available metrics
    const tvlScore = normalize(tvl, 500000, 0.000002);
    const txScore = normalize(txCount, 50, 0.04);
    const mcapScore = normalize(marketCap, 5000000, 0.0000002);

    score = Math.round(
      (tvl !== null ? tvlScore * 0.4 : 0) +
      (txCount !== null ? txScore * 0.3 : 0) +
      (marketCap !== null ? mcapScore * 0.3 : 0)
    );

    confidence = 50;
  }

  return { score, confidence };
}

/**
 * Determine trend based on GitHub activity
 */
function calculateTrend(github: RawCompanyData['indexData']['github']): "up" | "down" | "stable" {
  const commits = github.totalCommits30d ?? 0;
  const contributors = github.activeContributors30d ?? 0;

  // Strong positive indicators
  if (commits > 100 && contributors > 10) return "up";
  if (commits > 50 && contributors > 5) return "up";

  // Negative indicators
  if (commits < 5) return "down";
  if (commits < 20 && contributors < 2) return "down";

  return "stable";
}

/**
 * Calculate overall score with category-aware weighting
 */
function calculateOverallScore(
  teamHealth: { score: number; confidence: number },
  community: { score: number; confidence: number },
  adoption: { score: number; confidence: number },
  category: string
): { score: number; confidence: number } {
  const infraCategories = ['infra', 'infrastructure', 'dev-tools', 'developer-tools'];
  const isInfra = infraCategories.includes(category.toLowerCase());

  let weights = {
    team: 0.4,
    community: 0.3,
    adoption: 0.3
  };

  if (isInfra) {
    // Infrastructure: GitHub activity and community are most important
    weights = {
      team: 0.6,
      community: 0.4,
      adoption: 0.0 // Ignore on-chain for infra
    };
  } else if (category === 'defi') {
    // DeFi: On-chain adoption is critical
    weights = {
      team: 0.25,
      community: 0.25,
      adoption: 0.5
    };
  } else if (category === 'dao') {
    // DAO: Community is most important
    weights = {
      team: 0.3,
      community: 0.5,
      adoption: 0.2
    };
  }

  const score = Math.round(
    teamHealth.score * weights.team +
    community.score * weights.community +
    adoption.score * weights.adoption
  );

  // Overall confidence is weighted average of component confidences
  const totalWeight = weights.team + weights.community + weights.adoption;
  const confidence = Math.round(
    (teamHealth.confidence * weights.team +
     community.confidence * weights.community +
     adoption.confidence * weights.adoption) / totalWeight
  );

  return { score, confidence };
}

/**
 * Calculate all scores for a company
 */
function calculateCompanyScores(data: RawCompanyData): Scores {
  const teamHealth = calculateTeamHealth(data.indexData.github);
  const community = calculateCommunity(data.indexData.twitter);
  const adoption = calculateAdoption(data.indexData.onchain, data.category);
  const overall = calculateOverallScore(teamHealth, community, adoption, data.category);
  const trend = calculateTrend(data.indexData.github);

  return {
    overallScore: overall.score,
    teamHealthScore: teamHealth.score,
    communityScore: community.score,
    adoptionScore: adoption.score,
    trend,
    confidence: overall.confidence,
  };
}

/**
 * Main function
 */
async function main() {
  console.log("🧮 Starting Score Calculation");
  console.log("📂 Reading from:", DATA_DIR);
  console.log("💾 Writing to:", OUTPUT_DIR);
  console.log("");

  const files = fs.readdirSync(DATA_DIR).filter(f =>
    f.endsWith('.json') && f !== 'all-companies.json'
  );

  let processed = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const rawData: RawCompanyData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      const scores = calculateCompanyScores(rawData);

      const scoredData = {
        ...rawData,
        scores,
      };

      // Save to output directory
      const outputPath = path.join(OUTPUT_DIR, file);
      fs.writeFileSync(outputPath, JSON.stringify(scoredData, null, 2));

      console.log(`✅ ${rawData.name.padEnd(30)} | Overall: ${scores.overallScore.toString().padStart(3)} | Team: ${scores.teamHealthScore.toString().padStart(3)} | Community: ${scores.communityScore.toString().padStart(3)} | Adoption: ${scores.adoptionScore.toString().padStart(3)} | Confidence: ${scores.confidence}%`);

      processed++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
      errors++;
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Score Calculation Complete!");
  console.log(`Processed: ${processed} companies`);
  console.log(`Errors: ${errors} companies`);
  console.log("=".repeat(80));
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
