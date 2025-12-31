'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function DashboardHeader() {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    name: segment.charAt(0).toUpperCase() + segment.slice(1),
    href: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-8 flex items-center">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.href} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={
                crumb.isLast
                  ? 'text-sm font-medium text-gray-900'
                  : 'text-sm text-gray-500'
              }
            >
              {crumb.name}
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
