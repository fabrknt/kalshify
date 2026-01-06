/**
 * Update companies with subcategory and chains from config
 * Run with: pnpm tsx scripts/update-subcategory-chains.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { COMPANY_CONFIGS } from "../src/lib/cindex/company-configs";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";

if (!connectionString) {
    console.error("❌ DATABASE_URL or DIRECT_URL environment variable is required");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,
    ssl: connectionString.includes("supabase.co")
        ? { rejectUnauthorized: false }
        : undefined,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

async function updateCompanies() {
    console.log("🔄 Updating companies with subcategory and chains...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const companyConfig of COMPANY_CONFIGS) {
        try {
            // Get chain from onchain config if chains not specified
            const chains = companyConfig.chains || [companyConfig.onchain.chain];

            await prisma.company.update({
                where: { slug: companyConfig.slug },
                data: {
                    subcategory: companyConfig.subcategory || null,
                    chains: chains,
                },
            });

            console.log(
                `✅ ${companyConfig.name}: subcategory=${companyConfig.subcategory || "none"}, chains=[${chains.join(", ")}]`
            );
            successCount++;
        } catch (error: any) {
            if (error.code === "P2025") {
                console.log(`⚠️  ${companyConfig.name}: not found in database`);
            } else {
                console.error(`❌ Error updating ${companyConfig.slug}:`, error.message);
            }
            errorCount++;
        }
    }

    console.log(`\n📊 Update complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ⚠️  Skipped/Errors: ${errorCount}`);
}

updateCompanies()
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
