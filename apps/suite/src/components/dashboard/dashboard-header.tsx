'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Menu } from 'lucide-react';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <div className="h-16 border-b border-border bg-card px-4 md:px-6 lg:px-8 flex items-center justify-between">
      {/* Mobile Menu Button & Breadcrumbs */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-foreground hover:bg-muted rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <nav className="flex items-center gap-1 md:gap-2 min-w-0">
          {breadcrumbs.length > 0 ? (
            <>
              {breadcrumbs.length > 2 ? (
                // Truncate breadcrumbs on mobile
                <>
                  <span className="text-sm text-muted-foreground/75 hidden sm:inline">
                    {breadcrumbs[0].name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400 hidden sm:inline" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {breadcrumbs[breadcrumbs.length - 1].name}
                  </span>
                </>
              ) : (
                breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1 md:gap-2">
                    {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                    <span
                      className={
                        crumb.isLast
                          ? 'text-sm font-medium text-foreground truncate'
                          : 'text-sm text-muted-foreground/75'
                      }
                    >
                      {crumb.name}
                    </span>
                  </div>
                ))
              )}
            </>
          ) : (
            <span className="text-sm font-medium text-foreground">Dashboard</span>
          )}
        </nav>
      </div>
      {/* Suite Badge */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 hidden sm:inline">
          PREVIEW
        </span>
        <div className="text-xs text-muted-foreground/75 hidden md:block">
          <span className="font-medium text-foreground">Fabrknt Suite</span>
        </div>
      </div>
    </div>
  );
}
