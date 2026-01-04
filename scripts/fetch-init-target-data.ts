/**
 * Fetch Real Data for Initial Target Companies
 *
 * This script fetches real on-chain, GitHub, and social data for early-stage
 * Web3 companies listed in INIT_TARGET.md
 *
 * Usage: npx tsx scripts/fetch-init-target-data.ts
 */

import { prisma } from "../src/lib/db";
import INIT_TARGET_COMPANIES, { TargetCompany } from "./init-target-companies";

// =========================
// Configuration
// =========================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// =========================
// GitHub Data Fetcher
// =========================

interface GitHubData {
  totalStars: number;
  totalForks: number;
  totalCommits30d: number;
  activeContributors30d: number;
  totalContributors: number;
  lastCommitDate: Date | null;
  repoCount: number;
}

async function fetchGitHubData(githubOrg: string): Promise<GitHubData> {
  if (!GITHUB_TOKEN) {
    console.warn("⚠️  GITHUB_TOKEN not set, skipping GitHub data");
    return {
      totalStars: 0,
      totalForks: 0,
      totalCommits30d: 0,
      activeContributors30d: 0,
      totalContributors: 0,
      lastCommitDate: null,
      repoCount: 0,
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    };

    // Fetch organization repos
    const reposResponse = await fetch(
      `https://api.github.com/orgs/${githubOrg}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!reposResponse.ok) {
      console.warn(`⚠️  GitHub org ${githubOrg} not found or private`);
      return {
        totalStars: 0,
        totalForks: 0,
        totalCommits30d: 0,
        activeContributors30d: 0,
        totalContributors: 0,
        lastCommitDate: null,
        repoCount: 0,
      };
    }

    const repos = await reposResponse.json();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalStars = 0;
    let totalForks = 0;
    let totalCommits30d = 0;
    let contributorsSet = new Set<string>();
    let activeContributorsSet = new Set<string>();
    let lastCommitDate: Date | null = null;

    // Aggregate data from all repos
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      // Fetch recent commits
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${githubOrg}/${repo.name}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=100`,
          { headers }
        );

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          totalCommits30d += commits.length;

          // Track contributors
          commits.forEach((commit: any) => {
            if (commit.author?.login) {
              activeContributorsSet.add(commit.author.login);
            }
          });

          // Track last commit date
          if (commits.length > 0 && commits[0].commit?.author?.date) {
            const commitDate = new Date(commits[0].commit.author.date);
            if (!lastCommitDate || commitDate > lastCommitDate) {
              lastCommitDate = commitDate;
            }
          }
        }
      } catch (err) {
        console.warn(`⚠️  Could not fetch commits for ${repo.name}`);
      }

      // Fetch all contributors
      try {
        const contributorsResponse = await fetch(
          `https://api.github.com/repos/${githubOrg}/${repo.name}/contributors?per_page=100`,
          { headers }
        );

        if (contributorsResponse.ok) {
          const contributors = await contributorsResponse.json();
          contributors.forEach((contributor: any) => {
            if (contributor.login) {
              contributorsSet.add(contributor.login);
            }
          });
        }
      } catch (err) {
        console.warn(`⚠️  Could not fetch contributors for ${repo.name}`);
      }

      // Rate limiting: wait 1 second between repos
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      totalStars,
      totalForks,
      totalCommits30d,
      activeContributors30d: activeContributorsSet.size,
      totalContributors: contributorsSet.size,
      lastCommitDate,
      repoCount: repos.length,
    };
  } catch (error) {
    console.error(`❌ Error fetching GitHub data for ${githubOrg}:`, error);
    return {
      totalStars: 0,
      totalForks: 0,
      totalCommits30d: 0,
      activeContributors30d: 0,
      totalContributors: 0,
      lastCommitDate: null,
      repoCount: 0,
    };
  }
}

// =========================
// Twitter Data Fetcher
// =========================

interface TwitterData {
  followers: number;
  following: number;
  tweetCount: number;
  accountCreatedAt: Date | null;
}

async function fetchTwitterData(twitterHandle: string): Promise<TwitterData> {
  if (!TWITTER_BEARER_TOKEN) {
    console.warn("⚠️  TWITTER_BEARER_TOKEN not set, skipping Twitter data");
    return {
      followers: 0,
      following: 0,
      tweetCount: 0,
      accountCreatedAt: null,
    };
  }

  try {
    const headers = {
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    };

    // Get user by username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${twitterHandle}?user.fields=public_metrics,created_at`,
      { headers }
    );

    if (!userResponse.ok) {
      console.warn(`⚠️  Twitter user @${twitterHandle} not found`);
      return {
        followers: 0,
        following: 0,
        tweetCount: 0,
        accountCreatedAt: null,
      };
    }

    const userData = await userResponse.json();
    const user = userData.data;

    return {
      followers: user.public_metrics?.followers_count || 0,
      following: user.public_metrics?.following_count || 0,
      tweetCount: user.public_metrics?.tweet_count || 0,
      accountCreatedAt: user.created_at ? new Date(user.created_at) : null,
    };
  } catch (error) {
    console.error(`❌ Error fetching Twitter data for @${twitterHandle}:`, error);
    return {
      followers: 0,
      following: 0,
      tweetCount: 0,
      accountCreatedAt: null,
    };
  }
}

// =========================
// Score Calculator
// =========================

function calculateScores(githubData: GitHubData, twitterData: TwitterData) {
  // Team Health Score (0-100)
  const teamHealthScore = Math.min(
    100,
    Math.round(
      (githubData.totalCommits30d * 0.4) +
      (githubData.activeContributors30d * 5) +
      (githubData.totalStars * 0.05) +
      (githubData.repoCount * 2)
    )
  );

  // Growth Score (0-100) - Based on activity and reach
  const growthScore = Math.min(
    100,
    Math.round(
      (twitterData.followers * 0.01) +
      (githubData.totalCommits30d * 0.5) +
      (githubData.totalStars * 0.1)
    )
  );

  // Social Score (0-100)
  const socialScore = Math.min(
    100,
    Math.round(
      (twitterData.followers * 0.015) +
      (twitterData.tweetCount * 0.005) +
      (githubData.totalStars * 0.1)
    )
  );

  // Overall Score (weighted average)
  const overallScore = Math.round(
    teamHealthScore * 0.4 +
    growthScore * 0.3 +
    socialScore * 0.3
  );

  // Trend determination
  let trend: "up" | "down" | "stable" = "stable";
  if (githubData.totalCommits30d > 50 && githubData.activeContributors30d > 3) {
    trend = "up";
  } else if (githubData.totalCommits30d < 10) {
    trend = "down";
  }

  return {
    overallScore,
    teamHealthScore,
    growthScore,
    socialScore,
    trend,
  };
}

// =========================
// Main Fetching Function
// =========================

async function fetchCompanyData(company: TargetCompany) {
  console.log(`\n📊 Fetching data for: ${company.name}`);

  // Fetch GitHub data
  let githubData: GitHubData = {
    totalStars: 0,
    totalForks: 0,
    totalCommits30d: 0,
    activeContributors30d: 0,
    totalContributors: 0,
    lastCommitDate: null,
    repoCount: 0,
  };

  if (company.github) {
    console.log(`  ↳ Fetching GitHub: ${company.github}`);
    githubData = await fetchGitHubData(company.github);
    console.log(`    ✓ Stars: ${githubData.totalStars}, Commits (30d): ${githubData.totalCommits30d}`);
  }

  // Fetch Twitter data
  let twitterData: TwitterData = {
    followers: 0,
    following: 0,
    tweetCount: 0,
    accountCreatedAt: null,
  };

  if (company.twitter) {
    console.log(`  ↳ Fetching Twitter: @${company.twitter}`);
    twitterData = await fetchTwitterData(company.twitter);
    console.log(`    ✓ Followers: ${twitterData.followers}`);
  }

  // Calculate scores
  const scores = calculateScores(githubData, twitterData);
  console.log(`  ↳ Scores: Overall=${scores.overallScore}, Team=${scores.teamHealthScore}, Growth=${scores.growthScore}`);

  // Prepare index data
  const indexData = {
    github: {
      totalStars: githubData.totalStars,
      totalForks: githubData.totalForks,
      totalCommits30d: githubData.totalCommits30d,
      activeContributors30d: githubData.activeContributors30d,
      totalContributors: githubData.totalContributors,
      lastCommitDate: githubData.lastCommitDate?.toISOString() || null,
      repoCount: githubData.repoCount,
    },
    twitter: {
      followers: twitterData.followers,
      following: twitterData.following,
      tweetCount: twitterData.tweetCount,
      accountCreatedAt: twitterData.accountCreatedAt?.toISOString() || null,
    },
    social: {
      twitterFollowers: twitterData.followers,
    },
    onchain: {
      chain: company.chain,
      contractAddress: company.contractAddress || null,
      tokenAddress: company.tokenAddress || null,
    },
    metadata: {
      fetchedAt: new Date().toISOString(),
      dataSource: "init-target-script",
    },
  };

  // Upsert to database
  await prisma.company.upsert({
    where: { slug: company.slug },
    update: {
      name: company.name,
      category: company.category,
      description: company.description,
      website: company.website || null,
      logo: null, // Will be added manually later
      overallScore: scores.overallScore,
      teamHealthScore: scores.teamHealthScore,
      growthScore: scores.growthScore,
      socialScore: scores.socialScore,
      trend: scores.trend,
      indexData: indexData as any,
      isActive: true,
      isListed: false,
    },
    create: {
      slug: company.slug,
      name: company.name,
      category: company.category,
      description: company.description,
      website: company.website || null,
      logo: null,
      overallScore: scores.overallScore,
      teamHealthScore: scores.teamHealthScore,
      growthScore: scores.growthScore,
      socialScore: scores.socialScore,
      trend: scores.trend,
      indexData: indexData as any,
      isActive: true,
      isListed: false,
    },
  });

  console.log(`  ✅ Saved to database: ${company.slug}`);
}

// =========================
// Main Script Execution
// =========================

async function main() {
  console.log("🚀 Starting Initial Target Data Fetch");
  console.log(`📋 Total companies to fetch: ${INIT_TARGET_COMPANIES.length}\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const company of INIT_TARGET_COMPANIES) {
    try {
      await fetchCompanyData(company);
      successCount++;

      // Rate limiting: wait 2 seconds between companies
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error processing ${company.name}:`, error);
      errorCount++;
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Fetch Complete!");
  console.log(`Success: ${successCount} companies`);
  console.log(`Errors: ${errorCount} companies`);
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
