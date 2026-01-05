/**
 * Verify logos are correctly stored in database
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyLogos() {
  try {
    console.log("🔍 Verifying Company Logos in Database\n");

    const companies = await prisma.company.findMany({
      select: {
        name: true,
        slug: true,
        overallScore: true,
        logo: true,
      },
      orderBy: {
        overallScore: 'desc',
      },
      take: 15,
    });

    console.log("🏆 Top 15 Companies with Logo Status:\n");
    companies.forEach((c, i) => {
      const hasLogo = c.logo ? '✅' : '❌';
      const logoPreview = c.logo ? c.logo.substring(0, 50) + '...' : 'No logo';
      console.log(
        `${(i + 1).toString().padStart(2)}. ${hasLogo} ${c.name.padEnd(25)} | ` +
        `Score: ${c.overallScore.toString().padStart(2)} | ${logoPreview}`
      );
    });

    const totalCompanies = await prisma.company.count();
    const companiesWithLogos = await prisma.company.count({
      where: { logo: { not: null } },
    });

    console.log(`\n📊 Summary:`);
    console.log(`  Total companies: ${totalCompanies}`);
    console.log(`  Companies with logos: ${companiesWithLogos}`);
    console.log(`  Coverage: ${Math.round((companiesWithLogos / totalCompanies) * 100)}%`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyLogos();
