/**
 * Merge individual company JSON files into one array
 * Usage: npx tsx scripts/merge-json-files.ts > data/all-companies.json
 */

import fs from "fs";
import path from "path";

const DATA_DIR = "data/companies";

if (!fs.existsSync(DATA_DIR)) {
  console.error(`Error: Directory ${DATA_DIR} not found`);
  process.exit(1);
}

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
const companies = [];

for (const file of files) {
  try {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const company = JSON.parse(content);
    companies.push(company);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
  }
}

// Output JSON array
console.log(JSON.stringify(companies, null, 2));
