# Initial Target Data Fetching

This script fetches **real data** for early-stage Web3 companies and protocols listed in `INIT_TARGET.md`.

## Overview

The script automatically collects:
- ✅ **GitHub data**: Stars, forks, commits (30d), contributors
- ✅ **Twitter data**: Followers, tweets, account age
- ✅ **Calculated scores**: Overall, Team Health, Growth, Social
- ✅ **Automatic storage** in your database

## Prerequisites

### 1. Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Required for GitHub data
GITHUB_TOKEN=your_github_token_here

# Required for Twitter data (optional but recommended)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Database
DATABASE_URL=your_database_url_here
```

### 2. API Keys Setup

#### GitHub Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "FABRKNT Data Fetcher"
4. Select scopes:
   - ✅ `public_repo`
   - ✅ `read:org`
5. Generate and copy the token
6. Add to `.env.local`: `GITHUB_TOKEN=ghp_your_token_here`

#### Twitter Bearer Token
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new project and app
3. Generate a Bearer Token
4. Add to `.env.local`: `TWITTER_BEARER_TOKEN=your_bearer_token_here`

## Usage

### Run the Script

```bash
npx tsx scripts/fetch-init-target-data.ts
```

### What It Does

1. **Reads company list** from `init-target-companies.ts` (45 companies)
2. **For each company**:
   - Fetches GitHub org data (stars, commits, contributors)
   - Fetches Twitter profile data (followers, tweets)
   - Calculates verification scores
   - Stores in database
3. **Progress updates** in terminal
4. **Summary report** at the end

### Expected Output

```
🚀 Starting Initial Target Data Fetch
📋 Total companies to fetch: 45

📊 Fetching data for: Fluid
  ↳ Fetching GitHub: Instadapp
    ✓ Stars: 342, Commits (30d): 127
  ↳ Fetching Twitter: @fluid_protocol
    ✓ Followers: 8234
  ↳ Scores: Overall=67, Team=72, Growth=58
  ✅ Saved to database: fluid-instadapp

...

==================================================
✅ Fetch Complete!
Success: 45 companies
Errors: 0 companies
==================================================
```

## Rate Limiting

The script includes built-in rate limiting:
- **1 second** between GitHub repo requests
- **2 seconds** between companies
- Total runtime: ~5-10 minutes for 45 companies

## Data Stored

For each company, the database will have:

```typescript
{
  slug: "fluid-instadapp",
  name: "Fluid",
  category: "defi",
  description: "A new modular DeFi protocol...",
  website: "https://fluid.instadapp.io",

  // Scores (0-100)
  overallScore: 67,
  teamHealthScore: 72,
  growthScore: 58,
  socialScore: 54,
  trend: "up" | "down" | "stable",

  // Raw data
  indexData: {
    github: {
      totalStars: 342,
      totalCommits30d: 127,
      activeContributors30d: 8,
      totalContributors: 23,
      repoCount: 5
    },
    twitter: {
      followers: 8234,
      tweetCount: 456
    }
  }
}
```

## Troubleshooting

### GitHub API Rate Limit

If you hit GitHub rate limits:
- Wait 1 hour
- Or use a different GitHub token
- Check current limits: https://api.github.com/rate_limit

### Twitter API Not Working

If Twitter data fails:
- Check your Bearer Token is valid
- Make sure you have "Read" permissions
- Script will continue without Twitter data (GitHub data still works)

### Company Not Found

If a company's GitHub org doesn't exist:
- Script will log a warning and continue
- Score will be calculated with available data
- You can manually add GitHub/Twitter handles later

## Updating Company List

To add more companies, edit `scripts/init-target-companies.ts`:

```typescript
export const INIT_TARGET_COMPANIES: TargetCompany[] = [
  // ... existing companies ...
  {
    name: "Your Company",
    slug: "your-company",
    category: "defi",
    chain: "ethereum",
    description: "Your description",
    website: "https://example.com",
    github: "your-github-org",
    twitter: "your_twitter_handle",
  },
];
```

Then run the script again. It will update existing companies and add new ones.

## Next Steps

After running the script:

1. **Verify data** at https://fabrknt.com/cindex
2. **Remove demo data warnings** in the UI
3. **Add company logos** manually (they're not auto-fetched)
4. **Test SYNERGY matching** with real companies
5. **Share first findings** on Twitter

## Schedule Regular Updates

To keep data fresh, run this weekly:

```bash
# Add to cron or Vercel cron jobs
0 0 * * 0 npx tsx scripts/fetch-init-target-data.ts
```

Or use Vercel Cron:
```typescript
// api/cron/fetch-data/route.ts
export async function GET() {
  // Run the fetch script
}
```

## Support

If you encounter issues:
1. Check `.env.local` has all required tokens
2. Verify tokens have correct permissions
3. Check database connection
4. Review error messages in console

---

**Ready to fetch real data!** 🚀
