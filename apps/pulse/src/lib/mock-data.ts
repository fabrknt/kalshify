export interface Contributor {
  id: string;
  name: string;
  walletAddress: string;
  avatar?: string;
  role: 'core' | 'contributor' | 'community';
  joinedAt: string;

  // Contribution stats
  totalScore: number;
  githubScore: number;
  discordScore: number;
  notionScore: number;

  // Activity counts
  githubPRs: number;
  githubReviews: number;
  discordMessages: number;
  discordHelpful: number;
  notionPages: number;

  // Recognition
  praisesReceived: number;
  praisesGiven: number;

  // Status
  isActive: boolean;
  lastActiveAt: string;
}

export interface Contribution {
  id: string;
  contributorId: string;
  contributorName: string;
  platform: 'github' | 'discord' | 'notion';
  type: 'pr' | 'review' | 'message' | 'page' | 'praise';
  title: string;
  description?: string;
  score: number;
  timestamp: string;
  metadata?: {
    url?: string;
    channel?: string;
    repository?: string;
  };
}

export interface HealthScore {
  date: string;
  overallScore: number; // 0-100
  teamRetentionScore: number;
  developerActivityScore: number;
  communityEngagementScore: number;
  activeContributors: number;
  totalContributions: number;
  qualityIndex: number; // Quality over quantity metric
}

/**
 * Generate mock contributors
 */
export function generateMockContributors(): Contributor[] {
  const now = new Date();

  return [
    {
      id: 'contrib-1',
      name: 'Alice Chen',
      walletAddress: '0xA1b2...C3d4',
      role: 'core',
      joinedAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 2850,
      githubScore: 1200,
      discordScore: 950,
      notionScore: 700,
      githubPRs: 45,
      githubReviews: 78,
      discordMessages: 342,
      discordHelpful: 89,
      notionPages: 23,
      praisesReceived: 34,
      praisesGiven: 28,
      isActive: true,
      lastActiveAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contrib-2',
      name: 'Bob Martinez',
      walletAddress: '0xB5c6...D7e8',
      role: 'core',
      joinedAt: new Date(now.getTime() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 2340,
      githubScore: 1450,
      discordScore: 620,
      notionScore: 270,
      githubPRs: 67,
      githubReviews: 52,
      discordMessages: 198,
      discordHelpful: 45,
      notionPages: 9,
      praisesReceived: 28,
      praisesGiven: 31,
      isActive: true,
      lastActiveAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contrib-3',
      name: 'Carol Kim',
      walletAddress: '0xC9d0...E1f2',
      role: 'contributor',
      joinedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 1680,
      githubScore: 780,
      discordScore: 540,
      notionScore: 360,
      githubPRs: 23,
      githubReviews: 34,
      discordMessages: 156,
      discordHelpful: 38,
      notionPages: 12,
      praisesReceived: 19,
      praisesGiven: 22,
      isActive: true,
      lastActiveAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contrib-4',
      name: 'David Okonkwo',
      walletAddress: '0xD3e4...F5g6',
      role: 'contributor',
      joinedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 1420,
      githubScore: 340,
      discordScore: 890,
      notionScore: 190,
      githubPRs: 12,
      githubReviews: 8,
      discordMessages: 267,
      discordHelpful: 67,
      notionPages: 6,
      praisesReceived: 15,
      praisesGiven: 18,
      isActive: true,
      lastActiveAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contrib-5',
      name: 'Emma Zhang',
      walletAddress: '0xE7f8...G9h0',
      role: 'community',
      joinedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 980,
      githubScore: 120,
      discordScore: 720,
      notionScore: 140,
      githubPRs: 4,
      githubReviews: 2,
      discordMessages: 234,
      discordHelpful: 52,
      notionPages: 5,
      praisesReceived: 12,
      praisesGiven: 14,
      isActive: true,
      lastActiveAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'contrib-6',
      name: 'Frank Wilson',
      walletAddress: '0xF1g2...H3i4',
      role: 'community',
      joinedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalScore: 560,
      githubScore: 80,
      discordScore: 380,
      notionScore: 100,
      githubPRs: 2,
      githubReviews: 1,
      discordMessages: 128,
      discordHelpful: 28,
      notionPages: 3,
      praisesReceived: 7,
      praisesGiven: 9,
      isActive: false,
      lastActiveAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

/**
 * Generate mock contributions
 */
export function generateMockContributions(days: number = 30): Contribution[] {
  const contributions: Contribution[] = [];
  const now = new Date();
  const contributors = generateMockContributors();

  const platforms: Contribution['platform'][] = ['github', 'discord', 'notion'];
  const types: Record<Contribution['platform'], Contribution['type'][]> = {
    github: ['pr', 'review'],
    discord: ['message', 'praise'],
    notion: ['page'],
  };

  const titles = {
    pr: ['Implement feature X', 'Fix bug in Y', 'Update documentation', 'Refactor Z component'],
    review: ['Review PR #123', 'Code review: Feature implementation', 'PR feedback provided'],
    message: ['Helped new member', 'Answered technical question', 'Shared resources', 'Organized community call'],
    praise: ['Great work on feature!', 'Thanks for the help', 'Excellent code review'],
    page: ['Technical specification', 'Meeting notes', 'Architecture doc', 'Onboarding guide'],
  };

  let id = 1;
  for (let i = 0; i < days * 8; i++) {
    const contributor = contributors[Math.floor(Math.random() * contributors.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const type = types[platform][Math.floor(Math.random() * types[platform].length)];
    const title = titles[type][Math.floor(Math.random() * titles[type].length)];

    const daysAgo = Math.floor(Math.random() * days);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);

    // Quality-weighted scoring (Omotenashi logic)
    let score = 10;
    if (type === 'pr') score = Math.floor(Math.random() * 50) + 30; // 30-80
    if (type === 'review') score = Math.floor(Math.random() * 30) + 20; // 20-50
    if (type === 'page') score = Math.floor(Math.random() * 40) + 25; // 25-65
    if (type === 'message') score = Math.floor(Math.random() * 15) + 5; // 5-20
    if (type === 'praise') score = Math.floor(Math.random() * 20) + 10; // 10-30

    contributions.push({
      id: `contribution-${id++}`,
      contributorId: contributor.id,
      contributorName: contributor.name,
      platform,
      type,
      title,
      score,
      timestamp: timestamp.toISOString(),
      metadata: {
        url: platform === 'github' ? `https://github.com/org/repo/pull/${Math.floor(Math.random() * 1000)}` : undefined,
        channel: platform === 'discord' ? ['#general', '#dev', '#support'][Math.floor(Math.random() * 3)] : undefined,
        repository: platform === 'github' ? 'fabrknt-suite' : undefined,
      },
    });
  }

  return contributions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/**
 * Generate health scores for last N days
 */
export function generateHealthScores(days: number = 30): HealthScore[] {
  const scores: HealthScore[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gradual improvement trend
    const trendFactor = 1 + (days - i) / days * 0.3;
    const randomFactor = 0.9 + Math.random() * 0.2;

    const activeContributors = Math.floor(5 * trendFactor * randomFactor);
    const totalContributions = Math.floor(40 * trendFactor * randomFactor);

    // Health score components
    const teamRetentionScore = Math.min(95, Math.floor(75 * trendFactor * randomFactor));
    const developerActivityScore = Math.min(90, Math.floor(70 * trendFactor * randomFactor));
    const communityEngagementScore = Math.min(85, Math.floor(65 * trendFactor * randomFactor));
    const qualityIndex = Math.min(95, Math.floor(80 * trendFactor * randomFactor));

    // Overall score (weighted average)
    const overallScore = Math.round(
      teamRetentionScore * 0.3 +
      developerActivityScore * 0.3 +
      communityEngagementScore * 0.2 +
      qualityIndex * 0.2
    );

    scores.push({
      date: date.toISOString().split('T')[0],
      overallScore,
      teamRetentionScore,
      developerActivityScore,
      communityEngagementScore,
      activeContributors,
      totalContributions,
      qualityIndex,
    });
  }

  return scores.reverse();
}

/**
 * Get mock data
 */
export function getMockContributors(): Contributor[] {
  return generateMockContributors();
}

export function getMockContributions(days: number = 30): Contribution[] {
  return generateMockContributions(days);
}

export function getMockHealthScores(days: number = 30): HealthScore[] {
  return generateHealthScores(days);
}

export function getTodayHealthScore(): HealthScore {
  const scores = getMockHealthScores(1);
  return scores[0];
}
