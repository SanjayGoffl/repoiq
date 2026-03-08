'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Brain, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-navy/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-green" />
          <span className="text-xl font-bold text-white">RepoIQ</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={ROUTES.DEMO}
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Demo
          </Link>
          <Link
            href={ROUTES.ANALYZE}
            className="text-sm text-muted transition-colors hover:text-white"
          >
            Analyze
          </Link>
          <Button asChild size="sm">
            <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-navy p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href={ROUTES.DEMO}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-navy-light hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </Link>
            <Link
              href={ROUTES.ANALYZE}
              className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-navy-light hover:text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Analyze Repo
            </Link>
            <Button asChild className="w-full">
              <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
