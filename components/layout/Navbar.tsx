'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Brain, Menu, X, GitBranch, BarChart3, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { href: ROUTES.DEMO, label: 'Demo' },
  { href: ROUTES.ANALYZE, label: 'Analyze' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/collaborate', label: 'Collaborate' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(19,19,19,0.92)'
          : 'rgba(14,14,14,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(66,71,84,0.25)'
          : '1px solid rgba(66,71,84,0.08)',
        boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 group-hover:shadow-glow"
            style={{
              background: 'linear-gradient(135deg, #adc6ff 0%, #4d8eff 100%)',
            }}
          >
            <Brain className="h-4.5 w-4.5" style={{ color: '#002e6a' }} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: '#e5e2e1' }}>
            RepoIQ
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium transition-all duration-150"
              style={{ color: '#8c909f' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#e5e2e1';
                (e.currentTarget as HTMLElement).style.background = 'rgba(42,42,42,1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#8c909f';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={ROUTES.AUTH}
            className="rounded-md px-4 py-2 text-sm font-medium transition-all duration-150 ghost-border-visible"
            style={{ color: '#c2c6d6' }}
          >
            Sign in
          </Link>
          <Link
            href={ROUTES.DASHBOARD}
            className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold btn-primary-gradient"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 md:hidden transition-colors duration-150"
          style={{ color: '#e5e2e1' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen
            ? <X className="h-5 w-5" />
            : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden p-4"
          style={{
            background: '#1c1b1b',
            borderTop: '1px solid rgba(66,71,84,0.2)',
          }}
        >
          <div className="flex flex-col gap-1 mb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: '#8c909f' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-3" style={{ borderTop: '1px solid rgba(66,71,84,0.15)' }}>
            <Link
              href={ROUTES.AUTH}
              className="rounded-md px-4 py-2.5 text-sm font-medium text-center ghost-border-visible"
              style={{ color: '#c2c6d6' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href={ROUTES.DASHBOARD}
              className="inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold btn-primary-gradient"
              onClick={() => setMobileMenuOpen(false)}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
