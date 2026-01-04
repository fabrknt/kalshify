'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isProduction = process.env.NODE_ENV === "production";

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
      {/* User Auth */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 hidden sm:inline">
          PREVIEW
        </span>
        {status === 'loading' ? (
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-foreground">
                {session.user?.name || session.user?.email}
              </span>
              <span className="text-[10px] text-muted-foreground">
                Signed in
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href={isProduction ? "#" : "/auth/signin"}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm font-medium ${
              isProduction
                ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={(e) => {
              if (isProduction) {
                e.preventDefault();
              }
            }}
            title={isProduction ? "Sign in is disabled in production" : "Sign In"}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}
      </div>
    </div>
  );
}
