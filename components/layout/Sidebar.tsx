'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  GitCompareArrows,
  Trophy,
  Settings,
  Brain,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ANALYZE, label: 'Analyze', icon: Search },
  { href: ROUTES.COMPARE, label: 'Compare', icon: GitCompareArrows },
  { href: ROUTES.LEADERBOARD, label: 'Leaderboard', icon: Trophy },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-navy lg:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Brain className="h-6 w-6 text-green" />
          <span className="text-lg font-bold text-white">RepoIQ</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 p-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green/10 text-green'
                    : 'text-muted hover:bg-navy-light hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
