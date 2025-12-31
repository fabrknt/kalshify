'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, LayoutDashboard, ShoppingBag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
  { name: 'My Listings', href: '/dashboard/seller', icon: Building2 },
  { name: 'Buyers', href: '/dashboard/buyers', icon: Users, disabled: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="text-4xl">🏗️</span>
        <div className="ml-2 flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">FABRIC</span>
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
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-foreground/90 hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground/75">
          <div className="font-medium text-foreground">FABRIC</div>
          <div className="mt-1">
            Part of <span className="font-semibold text-foreground">Fabrknt Suite</span>
          </div>
          <div className="mt-1 text-blue-700">👁️ Preview Only</div>
        </div>
      </div>
    </div>
  );
}
