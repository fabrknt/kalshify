import { Filter, Github, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@fabrknt/ui';
import { ContributorCard } from '@/components/dashboard/contributor-card';
import { getMockContributors } from '@/lib/mock-data';
import { formatNumber } from '@/lib/utils/format';

export default function ContributorsPage() {
  const contributors = getMockContributors();
  const coreContributors = contributors.filter(c => c.role === 'core');
  const regularContributors = contributors.filter(c => c.role === 'contributor');
  const communityContributors = contributors.filter(c => c.role === 'community');

  // Calculate aggregate stats
  const totalScore = contributors.reduce((sum, c) => sum + c.totalScore, 0);
  const totalGithub = contributors.reduce((sum, c) => sum + c.githubScore, 0);
  const totalDiscord = contributors.reduce((sum, c) => sum + c.discordScore, 0);
  const totalNotion = contributors.reduce((sum, c) => sum + c.notionScore, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contributors</h1>
          <p className="text-muted-foreground mt-2">
            View and manage team members and their contributions
          </p>
        </div>
        <Button variant="outline">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Contributors</p>
          <p className="text-3xl font-bold text-foreground">{contributors.length}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">
            {contributors.filter(c => c.isActive).length} active
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <Github className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">GitHub Score</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatNumber(totalGithub)}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">total contribution</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Discord Score</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatNumber(totalDiscord)}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">total contribution</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Notion Score</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{formatNumber(totalNotion)}</p>
          <p className="text-sm text-muted-foreground/75 mt-1">total contribution</p>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          All ({contributors.length})
        </Button>
        <Button variant="ghost" size="sm">
          Core ({coreContributors.length})
        </Button>
        <Button variant="ghost" size="sm">
          Contributors ({regularContributors.length})
        </Button>
        <Button variant="ghost" size="sm">
          Community ({communityContributors.length})
        </Button>
      </div>

      {/* Core Contributors */}
      {coreContributors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Core Team ({coreContributors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreContributors.map((contributor) => (
              <ContributorCard key={contributor.id} contributor={contributor} />
            ))}
          </div>
        </div>
      )}

      {/* Regular Contributors */}
      {regularContributors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Contributors ({regularContributors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularContributors.map((contributor) => (
              <ContributorCard key={contributor.id} contributor={contributor} />
            ))}
          </div>
        </div>
      )}

      {/* Community Contributors */}
      {communityContributors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Community ({communityContributors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityContributors.map((contributor) => (
              <ContributorCard key={contributor.id} contributor={contributor} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
