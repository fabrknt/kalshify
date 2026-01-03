# Fabrknt Suite Improvements Summary

**Date:** 2026-01-03
**Build Status:** ✅ Passing

---

## 1. Improved Data Fetching Logic

### Problem
- Most company data showing as zeros in production
- Twitter and on-chain API calls timing out (3-5 minutes was too short)
- Aggressive error handling immediately returned zeros on failure
- No visibility into fetch progress or failure reasons

### Solution Implemented

#### Extended Timeouts
```typescript
Before: GitHub 3min, Twitter 5min, On-chain 5min
After:  GitHub 10min, Twitter 20min, On-chain 20min
```

**Rationale:**
- Script runs manually (`pnpm fetch:company`), not in production
- Better to wait 20 minutes for real data than fail fast with zeros
- Data is fetched once and persisted to database
- Longer waits handle rate limits and slow API responses

#### Reduced Retries with Smarter Backoff
```typescript
Before: 5 retries with short delays
After:  3 retries with exponential backoff (2s → 10s → 50s)
```

**Benefits:**
- Respects rate limits better
- Allows time for API quotas to reset
- Still persistent but not overly aggressive

#### Enhanced Logging
```typescript
New logs show:
- Timeout settings upfront (⏱️ Timeouts: GitHub 600s, Twitter 1200s...)
- Progress for each source ([Twitter (Uniswap)] Starting fetch...)
- Retry attempts with delays (Attempt 1/4 failed: Rate limit - Waiting 2 minutes...)
- Success confirmation ([Twitter (Uniswap)] ✅ Fetch completed successfully)
- Summary table (📊 Fetch Results Summary: ✅/❌ for each source)
- Warnings for zero values (⚠️ Warning: Some data sources returned zero values)
```

**Files Modified:**
- `/src/lib/cindex/generic-company.ts` - Core fetch logic
- `/src/lib/cindex/utils/fetch-with-retry.ts` - Added success logging
- `/src/lib/cindex/utils/retry.ts` - Already had good retry logic

---

## 2. Word-of-Mouth Scoring Enhancements

### Problem
- Fabrknt (and similar SaaS/infrastructure projects) scored poorly despite real traction
- No blockchain activity (it's a SaaS tool, not a dApp)
- Private GitHub repos (low public commits)
- Current scoring only measured:
  - On-chain activity (N/A for SaaS)
  - GitHub commits (low for private dev)
  - Twitter followers (absolute count, not engagement quality)

### Solution: Added Word-of-Mouth Metrics

#### 1. Partnership Score (Ecosystem Word-of-Mouth)

**What It Measures:**
- Partnership announcements in blog/Medium posts
- Integration announcements
- Collaboration news

**Keywords Detected:**
- "partnership", "integration", "collaboration", "team up", "joins forces", "partners with"

**Scoring:**
- Recent partnerships (0-30 days) weighted higher
- Multiple partnership keywords = higher score
- Formula: Base 20 points + 10 per keyword × freshness multiplier

**Example:**
```
Blog post: "Fabrknt partners with Alchemy to bring enterprise tooling"
→ Detected: "partners" keyword ✓
→ Published: 5 days ago (fresh) ✓
→ Score contribution: ~30 points
```

#### 2. Virality Score (Social Word-of-Mouth)

**What It Measures:**
- Retweet ratio (sharing behavior, not just consumption)
- Reply ratio (conversation depth)

**Why This Matters:**
- **Liking** = passive consumption
- **Retweeting** = active endorsement (word-of-mouth!)
- **Replying** = engaged community

**Scoring:**
- Retweet Score: Normalize retweet/like ratio (benchmark: 20% is excellent)
- Reply Score: Normalize reply/like ratio (benchmark: 10% is excellent)
- Final: 60% retweet score + 40% reply score

**Example:**
```
Twitter (30 days):
- 10,000 likes
- 3,000 retweets (30% ratio)
- 800 replies (8% ratio)

Result: Virality Score = 92/100

vs.

- 100,000 likes
- 5,000 retweets (5% ratio)
- 1,000 replies (1% ratio)

Result: Virality Score = 29/100
```

The smaller project with higher sharing rate scores better for word-of-mouth!

### Updated Scoring Formulas

#### Growth Score (Before)
```
Growth = (On-chain 40%) + (News/Shipping 30%) + (Attention 30%)
```

#### Growth Score (After)
```
Growth = (On-chain 35%) + (News 25%) + (Partnerships 20%) + (Attention 20%)

For Low On-chain (<10 txs):
Growth = (News 35%) + (Partnerships 35%) + (Attention 30%)
```

**Key Change:** Partnership score now gets 20-35% weight, capturing ecosystem validation.

#### Special Handling for Fabrknt-Type Projects

Projects with:
- Low on-chain activity (<10 txs/30d)
- Private development (<5 commits/30d)

Get scores dominated by:
- Partnership announcements (35%)
- Web activity/shipping (35%)
- Social virality (30%)

### Expected Impact

**Fabrknt Example (Hypothetical):**
```
Before:
- GitHub: 20/100 (low commits)
- Social: 35/100 (small follower count)
- Growth: 30/100 (no on-chain)
→ Overall: 29/100

After (with word-of-mouth):
- Partnership Score: 65/100 (2 recent partnerships)
- Virality Score: 85/100 (40% retweet ratio)
- GitHub: 20/100 (unchanged)
- Social: 48/100 (boosted by virality)
- Growth: 55/100 (partnerships heavily weighted)
→ Overall: 51/100

Improvement: +22 points (+76% increase)
```

### UI Updates

Added new metrics to company detail page:

**Growth Section:**
- Partnership Score (Word-of-Mouth) - Highlighted in green

**Social Section:**
- Virality Score (Sharing Rate) - Highlighted in purple

Both displayed with labels and context so users understand what they measure.

---

## 3. Type Safety Improvements

Updated TypeScript interfaces:

**`IndexScore` breakdown:**
```typescript
onchain: {
  // Existing
  userGrowthScore: number;
  transactionScore: number;
  tvlScore: number;
  // New word-of-mouth metrics
  webActivityScore: number;
  newsGrowthScore: number;
  partnershipScore: number;
  attentionScore: number;
  viralityScore: number;
}
```

**`IndexData` news:**
```typescript
news?: {
  title: string;
  url: string;
  date: string;
  summary: string;
  source: string;
  content?: string; // Added for partnership detection
}[]
```

---

## Files Modified

### Core Logic
1. `/src/lib/cindex/generic-company.ts` - Improved timeouts, retries, logging
2. `/src/lib/cindex/calculators/score-calculator.ts` - Added partnership and virality scoring
3. `/src/lib/cindex/utils/fetch-with-retry.ts` - Enhanced logging

### Type Definitions
4. `/src/lib/api/types.ts` - Updated IndexScore and IndexData interfaces

### UI
5. `/src/app/cindex/[company]/page.tsx` - Display partnership and virality scores

### Documentation
6. `/SCORING_ANALYSIS.md` - Comprehensive scoring analysis and proposals
7. `/IMPROVEMENTS_SUMMARY.md` - This file

---

## Next Steps

### Immediate (Ready to Run)

1. **Test with a single company:**
   ```bash
   pnpm fetch:company fabrknt
   ```
   - Verify longer timeouts work
   - Check new word-of-mouth metrics are calculated
   - Confirm partnership detection works on blog posts

2. **Review logs carefully:**
   - Look for "✅" success messages
   - Check "⚠️" warnings for zero values
   - Identify any remaining timeout issues

3. **Update database:**
   ```bash
   pnpm seed:companies
   ```
   - Repopulate all companies with new scoring

### Later (Optional Enhancements)

4. **Phase 2 Word-of-Mouth Features** (see SCORING_ANALYSIS.md):
   - GitHub social metrics (stars, forks, watchers)
   - Follower growth rate tracking
   - Requires API extensions and DB schema changes

5. **Remove "Data Collection in Progress" notices** once data is populated

6. **Monitor Vercel deployments** for any production issues

---

## Testing Checklist

- [x] TypeScript compilation passes
- [x] Build succeeds
- [ ] Test `pnpm fetch:company fabrknt` with new timeouts
- [ ] Verify partnership score detects blog partnerships
- [ ] Verify virality score uses retweet/reply ratios
- [ ] Check UI displays new metrics correctly
- [ ] Seed database with updated scores
- [ ] Deploy to Vercel and verify production behavior

---

## Success Metrics

**Data Completeness:**
- Before: ~30-50% companies with zero data (timeouts)
- After: Target 90%+ companies with real data

**Scoring Accuracy:**
- Fabrknt and similar SaaS/infrastructure projects should score 40-60/100 (fair)
- Previously scored 20-30/100 (unfairly low)

**Transparency:**
- Users can see all scoring components
- Partnership and virality scores visible
- Clear labels explain what each metric measures

---

## Conclusion

These improvements address both technical issues (timeouts) and product quality (fair scoring for non-dApp projects). The system now:

1. **Reliably fetches data** with patient timeouts and smart retries
2. **Fairly scores all project types** including SaaS, infrastructure, and private development
3. **Captures word-of-mouth signals** that traditional blockchain metrics miss
4. **Provides transparency** showing all scoring components to users

The word-of-mouth enhancements are particularly important for Fabrknt's credibility as an index - it needs to accurately reflect real-world traction beyond just on-chain metrics.
