/**
 * Shared company data fetching functions
 * Can be used by both API routes and server components
 */

import { prisma } from "@/lib/db";

export async function getAllCompanies() {
    try {
        console.log("[getAllCompanies] Querying companies...");
        // Prisma auto-connects, no need for explicit $connect()
        const companies = await prisma.company.findMany({
            where: { isActive: true },
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                description: true,
                logo: true,
                website: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                trend: true,
                isListed: true,
            },
            orderBy: {
                overallScore: "desc",
            },
        });

        console.log(`[getAllCompanies] Found ${companies.length} companies`);
        return companies;
    } catch (error) {
        console.error("[getAllCompanies] Error fetching companies:", error);
        console.error(
            "[getAllCompanies] Error type:",
            error?.constructor?.name
        );
        console.error(
            "[getAllCompanies] Error message:",
            error instanceof Error ? error.message : String(error)
        );
        console.error("[getAllCompanies] Full error:", error);
        throw error;
    }
}

export async function searchCompanies(
    query?: string,
    category?: string,
    limit: number = 100
) {
    try {
        // Prisma auto-connects, no need for explicit $connect()
        const where: any = {
            isActive: true,
        };

        if (query) {
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ];
        }

        if (category) {
            where.category = category;
        }

        const companies = await prisma.company.findMany({
            where,
            select: {
                id: true,
                slug: true,
                name: true,
                category: true,
                description: true,
                logo: true,
                website: true,
                overallScore: true,
                teamHealthScore: true,
                growthScore: true,
                socialScore: true,
                trend: true,
                isListed: true,
            },
            orderBy: {
                overallScore: "desc",
            },
            take: limit,
        });

        return companies;
    } catch (error) {
        console.error("Error searching companies:", error);
        throw error;
    }
}
