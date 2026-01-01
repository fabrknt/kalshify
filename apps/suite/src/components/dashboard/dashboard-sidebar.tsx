'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Link2,
  Users,
  X,
  Brain,
  List,
  TrendingUp,
  Home,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const intelligenceNav = [
  { name: 'Spotlight', href: '/intelligence', icon: TrendingUp },
  { name: 'Companies', href: '/intelligence/companies', icon: List },
];

const matchNav = [
  { name: 'Spotlight', href: '/match', icon: TrendingUp },
  { name: 'Opportunities', href: '/match/opportunities', icon: Target },
  { name: 'My Opportunities', href: '/match/seller', icon: Building2 },
  { name: 'Partners', href: '/match/partners', icon: Users, disabled: true },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isIntelligence = pathname.startsWith('/intelligence');
  const isMatch = pathname.startsWith('/match');

  return (
    <>
      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-muted border-r border-border transform transition-transform duration-300 ease-in-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Header with Close Button */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <div onClick={onClose}>
              <Logo size="md" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-4 px-3 py-4 overflow-y-auto">
            {/* Home */}
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
                !isIntelligence && !isMatch
                  ? 'bg-gray-100 text-foreground'
                  : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
              )}
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>

            {/* INTELLIGENCE Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Brain className="h-4 w-4 text-purple-600" />
                Intelligence
              </div>
              <div className="space-y-1">
                {intelligenceNav.map((item) => {
                  const isActive =
                    item.href === '/intelligence'
                      ? pathname === '/intelligence'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'text-white bg-purple-600 shadow-lg shadow-purple-600/40'
                          : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* MATCH Section */}
            <div>
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Link2 className="h-4 w-4 text-cyan-600" />
                Match
              </div>
              <div className="space-y-1">
                {matchNav.map((item) => {
                  const isActive =
                    item.href === '/match'
                      ? pathname === '/match'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.name}
                        className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                        <span className="ml-auto text-xs">(Soon)</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        isActive
                          ? 'text-white bg-cyan-600 shadow-lg shadow-cyan-600/40'
                          : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
                      )}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-xs text-muted-foreground/75">
              <div className="font-medium text-foreground">Fabrknt Suite</div>
              <div className="mt-1">Intelligence + Match</div>
              <div className="mt-1 text-gray-600">Preview</div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-muted border-r border-border">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo size="md" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 px-3 py-4">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
              !isIntelligence && !isMatch
                ? 'bg-gray-100 text-foreground'
                : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
            )}
          >
            <Home className="mr-3 h-5 w-5" />
            Home
          </Link>

          {/* INTELLIGENCE Section */}
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Brain className="h-4 w-4 text-purple-600" />
              Intelligence
            </div>
            <div className="space-y-1">
              {intelligenceNav.map((item) => {
                const isActive =
                  item.href === '/intelligence'
                    ? pathname === '/intelligence'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'text-white bg-purple-600 shadow-lg shadow-purple-600/40'
                        : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* MATCH Section */}
          <div>
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Link2 className="h-4 w-4 text-cyan-600" />
              Match
            </div>
            <div className="space-y-1">
              {matchNav.map((item) => {
                const isActive =
                  item.href === '/match'
                    ? pathname === '/match'
                    : pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                      <span className="ml-auto text-xs">(Soon)</span>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all',
                      isActive
                        ? 'text-white bg-cyan-600 shadow-lg shadow-cyan-600/40'
                        : 'text-foreground/90 hover:bg-gray-50 hover:text-foreground'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="text-xs text-muted-foreground/75">
            <div className="font-medium text-foreground">Fabrknt Suite</div>
            <div className="mt-1">Intelligence + Match</div>
            <div className="mt-1 text-gray-600">Preview</div>
          </div>
        </div>
      </div>
    </>
  );
}
