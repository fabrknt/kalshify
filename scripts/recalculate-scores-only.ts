/**
 * Recalculate scores only (don't touch logos)
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { calculateIndexScore } from '../src/lib/cindex/calculators/score-calculator';
import type { GitHubTeamMetrics, TwitterMetrics, OnChainMetrics } from '../src/lib/api/types';

const SCORED_COMPANIES_DIR = path.join(process.cwd(), 'data', 'scored-companies');

interface ScoredCompany {
  slug: string;
  name: string;
  category: 'defi' | 'infrastructure' | 'nft' | 'dao' | 'gaming';
  description: string;
  website: string | null;
  logo: string | null;
  overallScore: number;
  teamHealthScore: number;
  growthScore: number;
  socialScore: number;
  walletQualityScore: number;
  trend: string;
  indexData: {
    github: GitHubTeamMetrics;
    twitter: TwitterMetrics;
    onchain: OnChainMetrics;
    metadata: any;
  };
  isActive: boolean;
  isListed: boolean;
}

async function recalculateScores() {
  console.log("🔄 Recalculating Scores with New Category Weights\n");

  // Get all company files
  const files = fs.readdirSync(SCORED_COMPANIES_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`📋 Found ${files.length} companies\n`);

  const results: Array<{
    slug: string;
    name: string;
    category: string;
    oldScore: number;
    newScore: number;
    change: number;
  }> = [];

  let scoresChanged = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(SCORED_COMPANIES_DIR, file);
    const data: ScoredCompany = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const oldScore = data.overallScore;

    // Recalculate scores using new weights
    const newScores = await calculateIndexScore(
      data.indexData.github,
      data.indexData.twitter,
      data.indexData.onchain,
      data.category
    );

    // Determine trend
    const trend: 'up' | 'stable' | 'down' =
      newScores.growthScore > 50 ? 'up' :
      newScores.growthScore < 30 ? 'down' : 'stable';

    // Update company data (keep logo as-is)
    const updated: ScoredCompany = {
      ...data,
      overallScore: newScores.overall,
      teamHealthScore: newScores.teamHealth,
      growthScore: newScores.growthScore,
      socialScore: newScores.socialScore,
      walletQualityScore: newScores.walletQuality,
      trend,
    };

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    const change = newScores.overall - oldScore;
    if (change !== 0) scoresChanged++;

    results.push({
      slug: data.slug,
      name: data.name,
      category: data.category,
      oldScore,
      newScore: newScores.overall,
      change,
    });

    console.log(`[${i + 1}/${files.length}] ${data.name.padEnd(25)} | ${oldScore.toString().padStart(2)} → ${newScores.overall.toString().padStart(2)} (${change > 0 ? '+' : ''}${change})`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("✅ Recalculation Complete!\n");
  console.log(`📊 Results:`);
  console.log(`  Scores changed: ${scoresChanged}/${files.length}`);
  console.log("=".repeat(80));

  // Show biggest changes
  console.log("\n🔝 Biggest Score Changes:");
  results
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | ` +
        `${r.oldScore.toString().padStart(2)} → ${r.newScore.toString().padStart(2)} ` +
        `(${r.change > 0 ? '+' : ''}${r.change}) [${r.category}]`
      );
    });

  // Show new top 10 by category
  console.log("\n🏆 Top 10 DeFi Projects:");
  results
    .filter(r => r.category === 'defi')
    .sort((a, b) => b.newScore - a.newScore)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | Score: ${r.newScore.toString().padStart(2)}`
      );
    });

  console.log("\n🏆 Top 10 Infrastructure Projects:");
  results
    .filter(r => r.category === 'infrastructure')
    .sort((a, b) => b.newScore - a.newScore)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | Score: ${r.newScore.toString().padStart(2)}`
      );
    });

  console.log("\n🏆 Overall Top 10:");
  results
    .sort((a, b) => b.newScore - a.newScore)
    .slice(0, 10)
    .forEach((r, i) => {
      console.log(
        `  ${(i + 1).toString().padStart(2)}. ${r.name.padEnd(25)} | Score: ${r.newScore.toString().padStart(2)} [${r.category}]`
      );
    });
}

recalculateScores().catch(console.error);
