import { Github, MessageSquare, FileText, Award, ExternalLink } from 'lucide-react';
import { cn } from '@fabrknt/ui';
import { getMockContributions } from '@/lib/mock-data';
import { formatRelativeTime, formatNumber } from '@/lib/utils/format';

const platformIcons = {
  github: Github,
  discord: MessageSquare,
  notion: FileText,
};

const platformColors = {
  github: 'bg-purple-100 text-purple-700',
  discord: 'bg-blue-100 text-blue-700',
  notion: 'bg-gray-100 text-gray-700',
};

const typeLabels = {
  pr: 'Pull Request',
  review: 'Code Review',
  message: 'Discord Message',
  praise: 'Praise',
  page: 'Notion Page',
};

export default function ContributionsPage() {
  const contributions = getMockContributions(30); // Last 30 days
  const githubContributions = contributions.filter(c => c.platform === 'github');
  const discordContributions = contributions.filter(c => c.platform === 'discord');
  const notionContributions = contributions.filter(c => c.platform === 'notion');

  // Calculate stats
  const totalScore = contributions.reduce((sum, c) => sum + c.score, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contributions</h1>
        <p className="text-gray-600 mt-2">
          Recent activity across GitHub, Discord, and Notion
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(contributions.length)}</p>
          <p className="text-sm text-gray-500 mt-1">last 30 days</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <Github className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-gray-600">GitHub</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(githubContributions.length)}</p>
          <p className="text-sm text-gray-500 mt-1">PRs and reviews</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-gray-600">Discord</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(discordContributions.length)}</p>
          <p className="text-sm text-gray-500 mt-1">messages and praises</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-gray-600" />
            <p className="text-sm text-gray-600">Notion</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatNumber(notionContributions.length)}</p>
          <p className="text-sm text-gray-500 mt-1">pages created</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {contributions.slice(0, 20).map((contribution) => {
            const Icon = platformIcons[contribution.platform];
            return (
              <div
                key={contribution.id}
                className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
              >
                {/* Icon */}
                <div className={cn(
                  'p-2 rounded-lg',
                  platformColors[contribution.platform]
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {contribution.contributorName}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {contribution.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 capitalize">
                          {typeLabels[contribution.type]}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(contribution.timestamp)}
                        </span>
                        {contribution.metadata?.channel && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-500">
                              {contribution.metadata.channel}
                            </span>
                          </>
                        )}
                        {contribution.metadata?.url && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <a
                              href={contribution.metadata.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600">
                        +{contribution.score}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Showing 20 of {contributions.length} contributions
          </p>
        </div>
      </div>

      {/* Omotenashi Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-purple-900 mb-2">
          About Omotenashi Scoring
        </h3>
        <div className="text-sm text-purple-800 space-y-1">
          <p>
            • <strong>Quality over Quantity:</strong> High-impact contributions earn more points
          </p>
          <p>
            • <strong>Pull Requests:</strong> 30-80 points (based on complexity and review feedback)
          </p>
          <p>
            • <strong>Code Reviews:</strong> 20-50 points (thoroughness matters)
          </p>
          <p>
            • <strong>Documentation:</strong> 25-65 points (comprehensive docs valued highly)
          </p>
          <p>
            • <strong>Community Help:</strong> 5-20 points (scaled by helpfulness reactions)
          </p>
        </div>
      </div>
    </div>
  );
}
