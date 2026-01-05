/**
 * Upload real company data to database
 * Reads from data/scored-companies/*.json
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SCORED_COMPANIES_DIR = path.join(process.cwd(), 'data', 'scored-companies');

interface ScoredCompany {
  slug: string;
  name: string;
  category: string;
  description: string;
  website: string | null;
  logo: string | null;
  overallScore: number;
  teamHealthScore: number;
  growthScore: number;
  socialScore: number;
  walletQualityScore: number;
  trend: string;
  indexData: any;
  isActive: boolean;
  isListed: boolean;
}

async function uploadCompanies() {
  try {
    console.log("📤 Uploading companies to database...\n");

    // Get all JSON files from scored-companies directory
    const files = fs.readdirSync(SCORED_COMPANIES_DIR)
      .filter(file => file.endsWith('.json'))
      .sort();

    console.log(`📋 Found ${files.length} company files\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const file of files) {
      const filePath = path.join(SCORED_COMPANIES_DIR, file);
      const data: ScoredCompany = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      try {
        await prisma.company.create({
          data: {
            slug: data.slug,
            name: data.name,
            category: data.category,
            description: data.description,
            logo: data.logo,
            website: data.website,
            overallScore: data.overallScore,
            teamHealthScore: data.teamHealthScore,
            growthScore: data.growthScore,
            socialScore: data.socialScore,
            walletQualityScore: data.walletQualityScore,
            trend: data.trend,
            indexData: data.indexData,
            isListed: data.isListed,
            isActive: data.isActive,
            lastFetchedAt: data.indexData?.metadata?.fetchedAt
              ? new Date(data.indexData.metadata.fetchedAt)
              : new Date(),
          },
        });

        console.log(`✅ [${successCount + 1}/${files.length}] Uploaded: ${data.name} (score: ${data.overallScore})`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error uploading ${data.name}:`, error.message);
        errors.push(`${data.name}: ${error.message}`);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(80));
    console.log(`✅ Upload Complete!`);
    console.log(`📊 Results:`);
    console.log(`  Success: ${successCount} companies`);
    console.log(`  Errors: ${errorCount} companies`);

    if (errors.length > 0) {
      console.log(`\n❌ Error Details:`);
      errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log("=".repeat(80));

    // Show final database stats
    const companyCount = await prisma.company.count();
    console.log(`\n📈 Final Database Stats:`);
    console.log(`  Total Companies: ${companyCount}`);

    // Show top 10 by score
    const topCompanies = await prisma.company.findMany({
      select: { name: true, overallScore: true, category: true },
      orderBy: { overallScore: 'desc' },
      take: 10,
    });

    console.log(`\n🏆 Top 10 Companies by Score:`);
    topCompanies.forEach((c, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${c.name.padEnd(25)} | Score: ${c.overallScore.toString().padStart(3)} | ${c.category}`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

uploadCompanies();
