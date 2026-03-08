'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

interface UpgradeBannerProps {
  quotaUsed: number;
  quotaLimit: number;
}

export function UpgradeBanner({ quotaUsed, quotaLimit }: UpgradeBannerProps) {
  return (
    <Card className="border-orange/50 bg-orange-900/10">
      <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange/20">
            <Zap className="h-5 w-5 text-orange" />
          </div>
          <div>
            <p className="font-medium text-white">
              You&apos;ve used {quotaUsed} of {quotaLimit} free analyses
            </p>
            <p className="text-sm text-muted">
              Upgrade to Pro for unlimited analyses
            </p>
          </div>
        </div>
        <Button asChild className="bg-orange hover:bg-orange/90">
          <Link href={ROUTES.SETTINGS}>Upgrade to Pro</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
