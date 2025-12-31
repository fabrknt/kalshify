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
        <Building2 className="h-8 w-8 text-green-600" />
        <span className="ml-2 text-xl font-bold text-foreground">FABRIC</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = item.href === '/dashboard'
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
          <div className="font-medium">FABRIC Terminal</div>
          <div>Premium M&A for Web3</div>
        </div>
      </div>
    </div>
  );
}
