import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface NpmDownloads {
    downloads: number;
    start: string;
    end: string;
    package: string;
}

/**
 * Fetch npm package download stats for the last 30 days
 */
async function fetchNpmDownloads(packageName: string): Promise<number | null> {
    try {
        const url = `https://api.npmjs.org/downloads/point/last-month/${packageName}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`  Package ${packageName} not found on npm`);
                return null;
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json() as NpmDownloads;
        return data.downloads;
    } catch (error) {
        console.error(`  Error fetching ${packageName}:`, error);
        return null;
    }
}

/**
 * Fetch downloads for all packages in an npm scope (e.g., @helius-labs/*)
 */
async function fetchScopeDownloads(scope: string): Promise<number> {
    try {
        // First, get all packages in the scope
        const registryUrl = `https://registry.npmjs.org/-/v1/search?text=scope:${scope}&size=250`;
        const response = await fetch(registryUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const packages = data.objects.map((obj: any) => obj.package.name);

        console.log(`  Found ${packages.length} packages in @${scope}`);

        let totalDownloads = 0;

        for (const pkg of packages) {
            const downloads = await fetchNpmDownloads(pkg);
            if (downloads) {
                console.log(`    ${pkg}: ${downloads.toLocaleString()}`);
                totalDownloads += downloads;
            }
            // Rate limit: wait 100ms between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return totalDownloads;
    } catch (error) {
        console.error(`  Error fetching scope @${scope}:`, error);
        return 0;
    }
}

/**
 * Map of company slugs to their npm package names (use specific package names, not broad scopes)
 */
const NPM_PACKAGES: Record<string, string[]> = {
    'helius': ['helius-sdk'],  // Main Helius SDK
    'anza': ['@anza-xyz/wallet-adapter'],
    'privy': ['@privy-io/react-auth', '@privy-io/server-auth'],
    'dynamic': ['@dynamic-labs/sdk-react-core', '@dynamic-labs/ethereum', '@dynamic-labs/wagmi-connector'],
    'openfort': ['@openfort/openfort-js'],
    'pimlico': ['permissionless'],
    'gelato': ['@gelatonetwork/relay-sdk'],
    'caldera': [],  // No public packages found
    'altlayer': [],  // No public packages found
    'espresso-systems': [],  // No public packages found
    'squads': ['@sqds/sdk'],
    'clockwork': [],  // No public packages found
    'blockscout-base': [],  // Infrastructure - no SDK
    'zeeve': [],  // No public packages found
    'adamik': [],  // No public packages found
    'spire': [],  // No public packages found
    'voltius': [],  // No public packages found
    'daimo': ['@daimo/userop'],
};

async function fetchAllNpmDownloads() {
    console.log('Fetching npm download stats for all companies...\n');

    for (const [slug, packages] of Object.entries(NPM_PACKAGES)) {
        if (packages.length === 0) {
            continue; // Skip companies with no npm packages
        }

        console.log(`\n--- ${slug.toUpperCase()} ---`);

        const company = await prisma.company.findUnique({
            where: { slug },
            select: { id: true, name: true, indexData: true }
        });

        if (!company) {
            console.log(`  Company not found in database`);
            continue;
        }

        let totalDownloads = 0;
        const packageStats: Record<string, number> = {};

        for (const pkg of packages) {
            const downloads = await fetchNpmDownloads(pkg);
            if (downloads !== null) {
                console.log(`  ${pkg}: ${downloads.toLocaleString()}`);
                totalDownloads += downloads;
                packageStats[pkg] = downloads;
            }

            // Rate limit between packages
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        if (totalDownloads > 0) {
            console.log(`\n  TOTAL: ${totalDownloads.toLocaleString()} downloads/month`);

            // Update database - properly merge with existing indexData
            const existingData = (company.indexData as any) || {};
            const updatedData = {
                ...existingData,
                npm: {
                    downloads30d: totalDownloads,
                    packages: packageStats,
                    fetchedAt: new Date().toISOString(),
                    fetchStatus: 'success',
                }
            };

            await prisma.company.update({
                where: { id: company.id },
                data: {
                    indexData: updatedData as any
                }
            });

            console.log(`  ✅ Updated database`);
        } else {
            console.log(`  No npm downloads found`);
        }
    }

    console.log('\n\n=== SUMMARY ===');

    // Get all companies with npm data
    const companies = await prisma.company.findMany({
        where: {
            slug: { in: Object.keys(NPM_PACKAGES) }
        },
        select: {
            name: true,
            slug: true,
            indexData: true,
        }
    });

    const sorted = companies
        .map(c => ({
            name: c.name,
            downloads: ((c.indexData as any)?.npm?.downloads30d || 0) as number
        }))
        .filter(c => c.downloads > 0)
        .sort((a, b) => b.downloads - a.downloads);

    sorted.forEach((c, i) => {
        console.log(`${String(i + 1).padStart(2)}. ${c.name.padEnd(25)} ${c.downloads.toLocaleString().padStart(12)} downloads/month`);
    });

    await prisma.$disconnect();
    await pool.end();
}

fetchAllNpmDownloads().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
});
