'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Target, Zap } from 'lucide-react';
import { cn } from '@fabrknt/ui';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Activity',
    href: '/dashboard/activity',
    icon: Activity,
  },
  {
    name: 'Campaigns',
    href: '/dashboard/campaigns',
    icon: Target,
    disabled: true, // Coming soon
  },
  {
    name: 'Conversions',
    href: '/dashboard/conversions',
    icon: Zap,
    disabled: true, // Coming soon
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-orange-600">TRACE</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.disabled ? '#' : item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-700'
                  : item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <Icon className="h-5 w-5" />
              {item.name}
              {item.disabled && (
                <span className="ml-auto text-xs text-gray-400">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">User</p>
            <p className="text-xs text-gray-500 truncate">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
