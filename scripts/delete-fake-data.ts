/**
 * Delete all fake/demo data from database
 * This will clear Companies, Swipes, Matches, etc. to prepare for real data
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function deleteFakeData() {
  try {
    console.log("🗑️  Deleting fake/demo data from database...\n");

    // Get current counts
    const companyCount = await prisma.company.count();
    const swipeCount = await prisma.swipe.count();
    const matchCount = await prisma.match.count();
    const claimedProfileCount = await prisma.claimedProfile.count();

    console.log("📊 Current database contents:");
    console.log(`  Companies: ${companyCount}`);
    console.log(`  Swipes: ${swipeCount}`);
    console.log(`  Matches: ${matchCount}`);
    console.log(`  Claimed Profiles: ${claimedProfileCount}`);
    console.log("");

    if (companyCount === 0) {
      console.log("✅ Database is already empty. Nothing to delete.");
      return;
    }

    // List companies to be deleted
    const companies = await prisma.company.findMany({
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    console.log("🗑️  Companies to be deleted:");
    companies.forEach((c, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${c.name} (${c.slug})`);
    });
    console.log("");

    // Delete in order (respecting foreign key constraints)
    // Only delete tables that exist

    // 1. Delete Matches (if any)
    if (matchCount > 0) {
      const deletedMatches = await prisma.match.deleteMany({});
      console.log(`✅ Deleted ${deletedMatches.count} matches`);
    }

    // 2. Delete Swipes
    if (swipeCount > 0) {
      const deletedSwipes = await prisma.swipe.deleteMany({});
      console.log(`✅ Deleted ${deletedSwipes.count} swipes`);
    }

    // 3. Delete Claimed Profiles
    if (claimedProfileCount > 0) {
      const deletedProfiles = await prisma.claimedProfile.deleteMany({});
      console.log(`✅ Deleted ${deletedProfiles.count} claimed profiles`);
    }

    // 4. Finally, delete Companies
    const deletedCompanies = await prisma.company.deleteMany({});
    console.log(`✅ Deleted ${deletedCompanies.count} companies`);

    console.log("\n" + "=".repeat(80));
    console.log("✅ All fake/demo data has been deleted!");
    console.log("📊 Database is now clean and ready for real company data.");
    console.log("=".repeat(80));

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

deleteFakeData();
