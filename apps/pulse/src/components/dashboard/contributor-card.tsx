import Link from 'next/link';
import { Github, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@fabrknt/ui';
import { Contributor } from '@/lib/mock-data';
import { formatNumber, truncateAddress, formatRelativeTime } from '@/lib/utils/format';

export interface ContributorCardProps {
  contributor: Contributor;
}

const roleColors = {
  core: 'bg-purple-100 text-purple-700',
  contributor: 'bg-blue-100 text-blue-700',
  community: 'bg-green-100 text-green-700',
};

export function ContributorCard({ contributor }: ContributorCardProps) {
  return (
    <Link href={`/dashboard/contributors/${contributor.id}`}>
      <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-lg">
              {contributor.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {contributor.name}
              </h3>
              <p className="text-sm text-muted-foreground/75 font-mono">
                {truncateAddress(contributor.walletAddress)}
              </p>
            </div>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
              roleColors[contributor.role]
            )}
          >
            {contributor.role}
          </span>
        </div>

        {/* Total Score */}
        <div className="mb-4 pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Contribution Score</p>
          <p className="text-3xl font-bold text-purple-600">
            {formatNumber(contributor.totalScore)}
          </p>
        </div>

        {/* Platform Scores */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Github className="h-3 w-3 text-muted-foreground/75" />
              <p className="text-xs text-muted-foreground">GitHub</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(contributor.githubScore)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <MessageSquare className="h-3 w-3 text-muted-foreground/75" />
              <p className="text-xs text-muted-foreground">Discord</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(contributor.discordScore)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <FileText className="h-3 w-3 text-muted-foreground/75" />
              <p className="text-xs text-muted-foreground">Notion</p>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {formatNumber(contributor.notionScore)}
            </p>
          </div>
        </div>

        {/* Recognition */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-purple-600">{contributor.praisesReceived}</span> praises received
          </div>
          <div
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              contributor.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {contributor.isActive
              ? `Active ${formatRelativeTime(contributor.lastActiveAt)}`
              : 'Inactive'}
          </div>
        </div>
      </div>
    </Link>
  );
}
