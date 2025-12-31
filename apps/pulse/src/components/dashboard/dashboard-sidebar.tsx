'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Activity, Award } from 'lucide-react';
import { cn } from '@fabrknt/ui';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Contributors',
    href: '/dashboard/contributors',
    icon: Users,
  },
  {
    name: 'Contributions',
    href: '/dashboard/contributions',
    icon: Activity,
  },
  {
    name: 'Recognition',
    href: '/dashboard/recognition',
    icon: Award,
    disabled: true, // Coming soon
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted border-r border-border">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <span className="text-4xl">💓</span>
        <div className="ml-2 flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">PULSE</h1>
          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-800">
            PREVIEW
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-100 text-purple-700'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-foreground/90 hover:bg-muted hover:text-foreground'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-5 w-5" />
              {item.name}
              {item.disabled && <span className="ml-auto text-xs text-gray-400">Soon</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
            O
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Organization</p>
            <p className="text-xs text-muted-foreground/75 truncate">6 contributors</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground/75 pt-2 border-t border-border">
          <div className="font-medium text-foreground">PULSE</div>
          <div className="mt-1">
            Part of <span className="font-semibold text-foreground">Fabrknt Suite</span>
          </div>
          <div className="mt-1 text-blue-700">👁️ Preview Only</div>
        </div>
      </div>
    </div>
  );
}
