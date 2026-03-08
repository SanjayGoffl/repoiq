'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Search, GitCompareArrows, Trophy, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ANALYZE, label: 'Analyze', icon: Search },
  { href: ROUTES.COMPARE, label: 'Compare', icon: GitCompareArrows },
  { href: ROUTES.LEADERBOARD, label: 'Board', icon: Trophy },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-navy/95 backdrop-blur lg:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-colors',
                isActive ? 'text-green' : 'text-muted hover:text-white'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
