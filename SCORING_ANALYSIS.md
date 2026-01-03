# Scoring Logic Analysis & Word-of-Mouth Improvements

## Current Scoring System Overview

### Core Metrics (0-100 each)

1. **GitHub Team Health** (40% weight for infrastructure)
   - Contributor Score (40%): Total + Active contributors (log scale)
   - Activity Score (40%): Commits in 30 days
   - Retention Score (20%): % of contributors active in 30d

2. **Twitter Social Score** (15% weight baseline, 10% for infrastructure)
   - Followers Score (70%): Log scale, 1K to 1M range
   - Engagement Score (30%): Engagement rate (likes + retweets + replies / followers)

3. **Combined Growth Score** (45% weight baseline, 35% for infrastructure)
   - On-Chain (40%): User growth + Transactions + TVL
   - News/Web Activity (30%): Shipping pace from blog/Medium
   - Attention/Virality (30%): Engagement velocity

### Dynamic Weight Adjustment

- **No Social Signal**: Redistributes social weight to GitHub/Growth
- **Private Development** (<5 commits/30d): Reduces GitHub weight by 80%, shifts to Growth
- **Low On-Chain** (<10 txs/30d): Shifts on-chain weight to Web/Social growth

### Special Handling for Fabrknt

Current implementation treats Fabrknt as:
- Infrastructure category (55% GitHub, 35% Growth, 10% Social)
- Uses web crawler for blog news (no real on-chain metrics)
- Likely triggers private development weight shift if GitHub commits are low
- Growth score dominated by Web Activity + Attention scores

## Word-of-Mouth Effects: Analysis & Proposals

### What is Word-of-Mouth in Web3 Context?

**Direct Signals** (measurable):
1. Twitter mentions by other projects/influencers
2. GitHub stars, forks, watchers (developer interest)
3. Retweet ratio (content sharing indicates endorsement)
4. Partnership announcements in news
5. Follower growth rate (organic discovery)

**Indirect Signals** (harder to measure):
6. Discord/Telegram mentions (requires API access)
7. Inbound links from other sites (requires web scraping)
8. Search volume trends (requires Google Trends API)

### Proposed Improvements for Fabrknt

#### 1. GitHub Social Metrics (Developer Word-of-Mouth)

**What to Track**:
- Stars: Developer interest/bookmarking
- Forks: Active usage/contribution intent
- Watchers: Ongoing interest

**Why Important for Fabrknt**:
- Infrastructure tools spread through developer word-of-mouth
- High star count indicates community trust
- Forks show active adoption

**Implementation**:
```typescript
export function calculateGitHubSocialScore(
    stargazers: number,
    forks: number,
    watchers: number
): number {
    // Log scale for stars (10 to 10K range)
    const starScore = normalize(Math.log10(1 + stargazers), Math.log10(10), Math.log10(10000));

    // Linear scale for forks (0 to 1000 range)
    const forkScore = normalize(forks, 0, 1000);

    // Linear scale for watchers (0 to 500 range)
    const watcherScore = normalize(watchers, 0, 500);

    return Math.round(starScore * 0.5 + forkScore * 0.3 + watcherScore * 0.2);
}
```

**Integration**:
- Add to GitHub metrics API call
- Weight: 20% of Team Health score for infrastructure projects

---

#### 2. Twitter Virality Indicators (Social Word-of-Mouth)

**What to Track**:
- Retweet/Like ratio (sharing > liking = word-of-mouth)
- Reply engagement (conversations indicate interest)
- Quote tweet count (discussion catalyst)

**Why Important for Fabrknt**:
- High retweet ratio means content is being shared (WoM)
- Replies indicate community engagement
- Quote tweets show thought leadership

**Implementation**:
```typescript
export function calculateViralityScore(engagement30d: {
    likes: number;
    retweets: number;
    replies: number;
}): number {
    const { likes, retweets, replies } = engagement30d;

    // Retweet ratio: measures sharing behavior (word-of-mouth)
    // Benchmark: 20% retweet rate is excellent
    const retweetRatio = likes > 0 ? (retweets / likes) * 100 : 0;
    const retweetScore = normalize(retweetRatio, 0, 20);

    // Reply ratio: measures conversation depth
    // Benchmark: 10% reply rate indicates strong engagement
    const replyRatio = likes > 0 ? (replies / likes) * 100 : 0;
    const replyScore = normalize(replyRatio, 0, 10);

    return Math.round(retweetScore * 0.6 + replyScore * 0.4);
}
```

**Integration**:
- Already have engagement data in Twitter metrics
- Add as component of Attention Score (currently only uses total engagement)

---

#### 3. Follower Growth Rate (Organic Discovery)

**What to Track**:
- Month-over-month follower growth
- Week-over-week growth for fast-growing projects

**Why Important for Fabrknt**:
- Steady growth indicates word-of-mouth discovery
- Spikes correlate with viral moments/announcements

**Implementation**:
```typescript
export function calculateFollowerGrowthScore(
    currentFollowers: number,
    previousFollowers: number, // 30 days ago
    timeframedays: number = 30
): number {
    if (previousFollowers === 0) return 0;

    const growthRate = ((currentFollowers - previousFollowers) / previousFollowers) * 100;

    // Monthly growth benchmarks:
    // 5% = stable, 10% = good, 20% = excellent, 50%+ = viral
    return normalize(growthRate, 0, 20);
}
```

**Integration**:
- Requires storing historical follower counts (DB schema change)
- Alternative: Use Twitter API to get account creation date and calculate average growth
- Weight: 30% of Social Score

---

#### 4. Partnership Signal Multiplier (Ecosystem Word-of-Mouth)

**What to Track**:
- News/blog posts mentioning partnerships, integrations
- Already partially implemented via `calculateIndexNewsScore`

**Enhancement**:
```typescript
export function calculatePartnershipScore(news?: IndexData["news"]): number {
    if (!news || news.length === 0) return 0;

    const partnershipKeywords = [
        /\bpartnership\b/i,
        /\bintegration\b/i,
        /\bcollaboration\b/i,
        /\bteam up\b/i,
        /\bjoins? forces\b/i,
        /\bannounces.*with\b/i,
    ];

    let score = 0;
    const now = new Date();

    news.forEach((item) => {
        const title = item.title || "";
        const content = item.content || "";
        const combined = `${title} ${content}`;

        const matchCount = partnershipKeywords.filter(k => k.test(combined)).length;

        if (matchCount > 0) {
            const date = new Date(item.date);
            const daysAgo = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

            // Recent partnerships more valuable
            const freshness = normalize(daysAgo, 30, 0);
            score += (20 + matchCount * 10) * (freshness / 100);
        }
    });

    return Math.min(100, Math.round(score));
}
```

**Integration**:
- Add to Growth Score as "Partnership Multiplier"
- Weight: Boost overall growth by 10-20% if partnership score > 50

---

### Recommended Implementation Priority

**Phase 1: Low-Hanging Fruit** (Can implement now)
1. ✅ Enhanced virality score using existing engagement data
2. ✅ Partnership signal multiplier using existing news data

**Phase 2: API Extensions** (Requires GitHub API changes)
3. GitHub social metrics (stars, forks, watchers)

**Phase 3: Database Schema Changes** (Requires DB migration)
4. Historical follower tracking for growth rate

---

## Updated Scoring Formula for Fabrknt

### Before (Current)
```
Overall Score = (GitHub * 0.55) + (Growth * 0.35) + (Social * 0.10)

Where:
- GitHub = Team Health only
- Growth = (On-chain * 0.4) + (Web Activity * 0.3) + (Attention * 0.3)
- Social = (Followers * 0.7) + (Engagement Rate * 0.3)
```

### After (Proposed with Word-of-Mouth)
```
Overall Score = (GitHub * 0.55) + (Growth * 0.35) + (Social * 0.10)

Where:
- GitHub = (Team Health * 0.8) + (GitHub Social * 0.2)
  - GitHub Social = Stars/Forks/Watchers

- Growth = (Web Activity * 0.4) + (Attention * 0.3) + (Partnerships * 0.3)
  - Attention includes Virality Score (retweet/reply ratios)
  - Partnerships = Partnership news signals

- Social = (Followers * 0.4) + (Engagement * 0.3) + (Virality * 0.3)
  - Virality = Retweet/Reply ratios (word-of-mouth sharing)
```

### Weight Adjustment for Private Dev
If GitHub commits < 5 (Fabrknt case):
```
Overall Score = (GitHub * 0.11) + (Growth * 0.79) + (Social * 0.10)
```

This amplifies word-of-mouth signals (Growth + Social) when code visibility is low.

---

## Next Steps

1. **Quick Win**: Implement Phase 1 enhancements (virality + partnership scores)
2. **Test**: Run scoring on Fabrknt with new formula
3. **Validate**: Compare before/after scores, ensure improvements reflect reality
4. **Deploy**: Update database with new scores
5. **Monitor**: Track score changes over time as new data comes in

---

## Expected Impact for Fabrknt

**Current Challenges**:
- Low GitHub activity (private development)
- No on-chain metrics (SaaS product)
- Relies heavily on web activity + social signals

**With Word-of-Mouth Enhancements**:
- Partnership announcements → +20-30 points to Growth
- Developer GitHub engagement → +15-20 points to Team Health
- High retweet ratios → +10-15 points to Social
- **Estimated Overall Impact**: +15-25 point increase to overall score

This better reflects Fabrknt's actual market presence and community traction.
