/**
 * Check what's currently in the database
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkDatabase() {
  try {
    console.log("🔍 Checking database...\n");

    // Count companies
    const companyCount = await prisma.company.count();
    console.log(`📊 Total companies in database: ${companyCount}\n`);

    if (companyCount > 0) {
      // Get all companies
      const companies = await prisma.company.findMany({
        select: {
          slug: true,
          name: true,
          category: true,
          overallScore: true,
          createdAt: true,
        },
        orderBy: {
          overallScore: 'desc',
        },
      });

      console.log("Companies in database:");
      console.log("=".repeat(80));
      companies.forEach((company, i) => {
        console.log(
          `${(i + 1).toString().padStart(3)}. ${company.name.padEnd(30)} | ` +
          `Score: ${company.overallScore.toString().padStart(3)} | ` +
          `${company.category.padEnd(15)} | ` +
          `Created: ${company.createdAt.toISOString().split('T')[0]}`
        );
      });
      console.log("=".repeat(80));
    }

    // Check other tables
    const userCount = await prisma.user.count();
    const listingCount = await prisma.listing.count();
    const swipeCount = await prisma.swipe.count();
    const matchCount = await prisma.match.count();

    console.log(`\n📈 Database Summary:`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Listings: ${listingCount}`);
    console.log(`  Swipes: ${swipeCount}`);
    console.log(`  Matches: ${matchCount}`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
