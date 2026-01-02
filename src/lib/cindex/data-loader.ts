/**
 * Data Loader for Index
 *
 * @deprecated This module is deprecated. All runtime data fetching should use Supabase via:
 * - getCompanies() from ./companies.ts
 * - getCompanyBySlug() from ./companies.ts
 *
 * These functions are kept only for use in data seeding scripts (scripts/ directory).
 * DO NOT use these functions in application code - they read from JSON files on disk.
 */

import { Company } from "./companies";
import { IndexScore } from "@/lib/api/types";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Load company data from JSON file if it exists
 * @deprecated Use getCompanyBySlug() from ./companies.ts instead (fetches from Supabase)
 * @param slug - Company slug
 * @returns Company data from JSON or null if not found
 */
export function loadCompanyFromJson(slug: string): Company | null {
    try {
        const dataPath = join(
            process.cwd(),
            "data",
            "companies",
            `${slug}.json`
        );

        if (!existsSync(dataPath)) {
            return null;
        }

        const rawData = readFileSync(dataPath, "utf-8");
        const jsonData = JSON.parse(rawData);

        // Return the company object from the JSON file
        if (jsonData.company) {
            return jsonData.company as Company;
        }

        return null;
    } catch (error) {
        console.error(`Error loading company data for ${slug}:`, error);
        return null;
    }
}

/**
 * Check if a company has real JSON data available
 * @deprecated This function checks for JSON files. Use Supabase queries instead.
 * @param slug - Company slug
 * @returns true if JSON file exists
 */
export function hasRealData(slug: string): boolean {
    const dataPath = join(process.cwd(), "data", "companies", `${slug}.json`);
    return existsSync(dataPath);
}

/**
 * Get all available JSON data files
 * @deprecated Use getCompanies() from ./companies.ts instead (fetches from Supabase)
 * @returns Array of company slugs that have real data
 */
export function getAvailableDataSlugs(): string[] {
    try {
        const dataDir = join(process.cwd(), "data", "companies");
        if (!existsSync(dataDir)) {
            return [];
        }

        const { readdirSync } = require("fs");
        const files = readdirSync(dataDir);

        return files
            .filter((file: string) => file.endsWith(".json"))
            .map((file: string) => file.replace(".json", ""));
    } catch (error) {
        console.error("Error reading data directory:", error);
        return [];
    }
}

/**
 * Load all companies from JSON files
 * @deprecated Use getCompanies() from ./companies.ts instead (fetches from Supabase)
 * @returns Array of Company objects from JSON files
 */
export function loadAllCompaniesFromJson(): Company[] {
    const slugs = getAvailableDataSlugs();
    const companies: Company[] = [];

    for (const slug of slugs) {
        const company = loadCompanyFromJson(slug);
        if (company) {
            companies.push(company);
        }
    }

    return companies;
}

/**
 * Load scores breakdown from JSON file
 * @deprecated Scores are available in the indexData field when fetching from Supabase
 * @param slug - Company slug
 * @returns IndexScore breakdown or null if not found
 */
export function loadCompanyScores(slug: string): IndexScore | null {
    try {
        const dataPath = join(
            process.cwd(),
            "data",
            "companies",
            `${slug}.json`
        );

        if (!existsSync(dataPath)) {
            return null;
        }

        const rawData = readFileSync(dataPath, "utf-8");
        const jsonData = JSON.parse(rawData);

        // Return the scores object from the JSON file
        if (jsonData.scores) {
            return jsonData.scores as IndexScore;
        }

        return null;
    } catch (error) {
        console.error(`Error loading scores for ${slug}:`, error);
        return null;
    }
}
