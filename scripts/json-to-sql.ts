/**
 * Convert JSON data to SQL INSERT statements
 * Usage: npx tsx scripts/json-to-sql.ts data/companies.json > data/insert-companies.sql
 */

import fs from "fs";

const jsonFile = process.argv[2] || "data/companies.json";

if (!fs.existsSync(jsonFile)) {
  console.error(`Error: File ${jsonFile} not found`);
  process.exit(1);
}

const companies = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));

console.log("-- ============================================");
console.log("-- Insert Company Data");
console.log(`-- Generated: ${new Date().toISOString()}`);
console.log(`-- Total companies: ${companies.length}`);
console.log("-- ============================================\n");

for (const company of companies) {
  const slug = company.slug.replace(/'/g, "''");
  const name = company.name.replace(/'/g, "''");
  const category = company.category.replace(/'/g, "''");
  const description = company.description ? company.description.replace(/'/g, "''") : null;
  const website = company.website ? company.website.replace(/'/g, "''") : null;
  const trend = company.trend.replace(/'/g, "''");
  const indexDataJson = JSON.stringify(company.indexData).replace(/'/g, "''");

  console.log(`INSERT INTO "Company" (`);
  console.log(`  "slug", "name", "category", "description", "website", "logo",`);
  console.log(`  "overallScore", "teamHealthScore", "growthScore", "socialScore", "walletQualityScore",`);
  console.log(`  "trend", "indexData", "isActive", "isListed", "createdAt", "updatedAt"`);
  console.log(`) VALUES (`);
  console.log(`  '${slug}',`);
  console.log(`  '${name}',`);
  console.log(`  '${category}',`);
  console.log(`  ${description ? `'${description}'` : 'NULL'},`);
  console.log(`  ${website ? `'${website}'` : 'NULL'},`);
  console.log(`  NULL,`);
  console.log(`  ${company.overallScore},`);
  console.log(`  ${company.teamHealthScore},`);
  console.log(`  ${company.growthScore},`);
  console.log(`  ${company.socialScore},`);
  console.log(`  ${company.walletQualityScore},`);
  console.log(`  '${trend}',`);
  console.log(`  '${indexDataJson}'::jsonb,`);
  console.log(`  ${company.isActive},`);
  console.log(`  ${company.isListed},`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`)`)
  console.log(`ON CONFLICT ("slug") DO UPDATE SET`);
  console.log(`  "name" = EXCLUDED."name",`);
  console.log(`  "category" = EXCLUDED."category",`);
  console.log(`  "description" = EXCLUDED."description",`);
  console.log(`  "website" = EXCLUDED."website",`);
  console.log(`  "overallScore" = EXCLUDED."overallScore",`);
  console.log(`  "teamHealthScore" = EXCLUDED."teamHealthScore",`);
  console.log(`  "growthScore" = EXCLUDED."growthScore",`);
  console.log(`  "socialScore" = EXCLUDED."socialScore",`);
  console.log(`  "trend" = EXCLUDED."trend",`);
  console.log(`  "indexData" = EXCLUDED."indexData",`);
  console.log(`  "updatedAt" = NOW();`);
  console.log();
}

console.log("-- ============================================");
console.log("-- Complete!");
console.log("-- ============================================");
