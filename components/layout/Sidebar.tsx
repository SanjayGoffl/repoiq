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
  BarChart3,
  Users,
  BookOpen,
  Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { href: ROUTES.ANALYZE, label: 'Analyze', icon: Search, group: 'main' },
  { href: ROUTES.COMPARE, label: 'Compare', icon: GitCompareArrows, group: 'main' },
  { href: ROUTES.LEADERBOARD, label: 'Leaderboard', icon: Trophy, group: 'explore' },
  { href: ROUTES.SETTINGS, label: 'Settings', icon: Settings, group: 'account' },
];

const FEATURE_ITEMS = [
  { href: '/analytics', label: 'Analytics', icon: BarChart3, group: 'explore', badge: 'NEW' },
  { href: '/collaborate', label: 'Collaborate', icon: Users, group: 'explore', badge: null },
  { href: '/lessons', label: 'Lessons', icon: BookOpen, group: 'explore', badge: null },
];

const GROUPS = [
  { key: 'main', label: 'WORKSPACE' },
  { key: 'explore', label: 'EXPLORE' },
  { key: 'account', label: 'ACCOUNT' },
];

export function Sidebar() {
  const pathname = usePathname();

  const allItems = [...NAV_ITEMS, ...FEATURE_ITEMS];

  return (
    <aside
      className="hidden w-60 shrink-0 lg:flex flex-col h-full"
      style={{ background: '#1c1b1b', borderRight: '1px solid rgba(66,71,84,0.2)' }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-2.5 px-5"
        style={{ borderBottom: '1px solid rgba(66,71,84,0.15)' }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)' }}
        >
          <Brain className="h-4 w-4" style={{ color: '#002e6a' }} />
        </div>
        <span className="text-base font-bold tracking-tight" style={{ color: '#e5e2e1' }}>
          RepoIQ
        </span>
        <span
          className="ml-auto label-mono text-[9px] px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(173,198,255,0.08)', color: '#adc6ff' }}
        >
          β
        </span>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {GROUPS.map((group) => {
          const items = allItems.filter((i) => i.group === group.key);
          if (!items.length) return null;
          return (
            <div key={group.key} className="mb-5 px-3">
              <p
                className="label-mono mb-2 px-3 text-[9px]"
                style={{ color: '#424754' }}
              >
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  const badge = (item as any).badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-[rgba(173,198,255,0.08)] text-[#adc6ff]'
                          : 'text-[#8c909f] hover:bg-[rgba(42,42,42,1)] hover:text-[#e5e2e1]'
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span
                          className="absolute left-0 h-5 w-0.5 rounded-r-full"
                          style={{ background: '#adc6ff' }}
                        />
                      )}
                      <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-[#adc6ff]' : '')} />
                      <span className="flex-1">{item.label}</span>
                      {badge && (
                        <span
                          className="label-mono text-[8px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(173,198,255,0.12)', color: '#adc6ff' }}
                        >
                          {badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom usage card */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(66,71,84,0.15)' }}>
        <div
          className="rounded-md p-3"
          style={{ background: 'rgba(173,198,255,0.04)', border: '1px solid rgba(173,198,255,0.1)' }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5" style={{ color: '#adc6ff' }} />
            <span className="text-xs font-medium" style={{ color: '#e5e2e1' }}>
              Free Plan
            </span>
          </div>
          <div className="mb-2 h-1 rounded-full overflow-hidden" style={{ background: '#2a2a2a' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: '60%',
                background: 'linear-gradient(90deg, #adc6ff, #4d8eff)',
              }}
            />
          </div>
          <p className="label-mono text-[9px]">3 / 5 analyses used</p>
        </div>
      </div>
    </aside>
  );
}
