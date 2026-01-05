/**
 * Fetch Real Data and Output as JSON
 * Usage: npx tsx scripts/fetch-to-json.ts > data/companies.json
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import INIT_TARGET_COMPANIES, { TargetCompany } from "./init-target-companies";
import fs from "fs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

interface GitHubData {
  totalStars: number;
  totalForks: number;
  totalCommits30d: number;
  activeContributors30d: number;
  totalContributors: number;
  lastCommitDate: Date | null;
  repoCount: number;
}

interface TwitterData {
  followers: number;
  following: number;
  tweetCount: number;
  accountCreatedAt: Date | null;
}

async function fetchGitHubData(githubOrg: string): Promise<GitHubData> {
  if (!GITHUB_TOKEN) {
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

    const reposResponse = await fetch(
      `https://api.github.com/orgs/${githubOrg}/repos?per_page=100&sort=updated`,
      { headers }
    );

    if (!reposResponse.ok) {
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

    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${githubOrg}/${repo.name}/commits?since=${thirtyDaysAgo.toISOString()}&per_page=100`,
          { headers }
        );

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          totalCommits30d += commits.length;

          commits.forEach((commit: any) => {
            if (commit.author?.login) {
              activeContributorsSet.add(commit.author.login);
            }
          });

          if (commits.length > 0 && commits[0].commit?.author?.date) {
            const commitDate = new Date(commits[0].commit.author.date);
            if (!lastCommitDate || commitDate > lastCommitDate) {
              lastCommitDate = commitDate;
            }
          }
        }
      } catch (err) {
        // Skip
      }

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
        // Skip
      }

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

async function fetchTwitterData(twitterHandle: string): Promise<TwitterData> {
  if (!TWITTER_BEARER_TOKEN) {
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

    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${twitterHandle}?user.fields=public_metrics,created_at`,
      { headers }
    );

    if (!userResponse.ok) {
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
    return {
      followers: 0,
      following: 0,
      tweetCount: 0,
      accountCreatedAt: null,
    };
  }
}

function calculateScores(githubData: GitHubData, twitterData: TwitterData) {
  const teamHealthScore = Math.min(
    100,
    Math.round(
      (githubData.totalCommits30d * 0.4) +
      (githubData.activeContributors30d * 5) +
      (githubData.totalStars * 0.05) +
      (githubData.repoCount * 2)
    )
  );

  const growthScore = Math.min(
    100,
    Math.round(
      (twitterData.followers * 0.01) +
      (githubData.totalCommits30d * 0.5) +
      (githubData.totalStars * 0.1)
    )
  );

  const socialScore = Math.min(
    100,
    Math.round(
      (twitterData.followers * 0.015) +
      (twitterData.tweetCount * 0.005) +
      (githubData.totalStars * 0.1)
    )
  );

  const overallScore = Math.round(
    teamHealthScore * 0.4 +
    growthScore * 0.3 +
    socialScore * 0.3
  );

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

async function fetchCompanyData(company: TargetCompany) {
  console.error(`\n📊 Fetching data for: ${company.name}`);

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
    console.error(`  ↳ Fetching GitHub: ${company.github}`);
    githubData = await fetchGitHubData(company.github);
    console.error(`    ✓ Stars: ${githubData.totalStars}, Commits (30d): ${githubData.totalCommits30d}`);
  }

  let twitterData: TwitterData = {
    followers: 0,
    following: 0,
    tweetCount: 0,
    accountCreatedAt: null,
  };

  if (company.twitter) {
    console.error(`  ↳ Fetching Twitter: @${company.twitter}`);
    twitterData = await fetchTwitterData(company.twitter);
    console.error(`    ✓ Followers: ${twitterData.followers}`);
  }

  const scores = calculateScores(githubData, twitterData);
  console.error(`  ↳ Scores: Overall=${scores.overallScore}, Team=${scores.teamHealthScore}, Growth=${scores.growthScore}`);

  return {
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
    walletQualityScore: 0,
    trend: scores.trend,
    indexData: {
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
    },
    isActive: true,
    isListed: false,
  };
}

async function main() {
  console.error("🚀 Starting Initial Target Data Fetch");
  console.error(`📋 Total companies to fetch: ${INIT_TARGET_COMPANIES.length}\n`);

  const companies = [];

  for (const company of INIT_TARGET_COMPANIES) {
    try {
      const data = await fetchCompanyData(company);
      companies.push(data);

      // Rate limiting: wait 2 seconds between companies
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error processing ${company.name}:`, error);
    }
  }

  console.error("\n" + "=".repeat(50));
  console.error("✅ Fetch Complete!");
  console.error(`Total companies: ${companies.length}`);
  console.error("=".repeat(50));

  // Output JSON to stdout
  console.log(JSON.stringify(companies, null, 2));
}

main().catch((e) => {
  console.error("❌ Fatal error:", e);
  process.exit(1);
});
