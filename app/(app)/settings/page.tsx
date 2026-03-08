'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useQuota } from '@/hooks/useQuota';
import { ROUTES } from '@/lib/constants';
import { User, Zap, BarChart3, Info } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isGuest } = useAuth();
  const { quota, isLoading: quotaLoading } = useQuota();

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const quotaPercent = quota
    ? (quota.quota_used / quota.quota_limit) * 100
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted">
          {isGuest
            ? 'Guest mode - settings are stored locally'
            : 'Manage your account and subscription'}
        </p>
      </div>

      {/* Guest mode notice */}
      {isGuest && (
        <Alert className="border-yellow-500/30 bg-yellow-500/10">
          <Info className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            You are in guest mode. Your analysis sessions are stored locally in your browser.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile */}
      {!isGuest && (
        <Card className="border-border bg-navy-light">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green/20">
                <User className="h-5 w-5 text-green" />
              </div>
              <div>
                <CardTitle className="text-base text-white">
                  {user?.name ?? 'User'}
                </CardTitle>
                <p className="text-sm text-muted">{user?.email ?? 'No email'}</p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Plan & Quota */}
      <Card className="border-border bg-navy-light">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green" />
              <CardTitle className="text-base text-white">
                Plan & Usage
              </CardTitle>
            </div>
            <Badge
              variant="outline"
              className={
                quota?.plan === 'pro'
                  ? 'border-green/50 text-green'
                  : 'border-muted/50 text-muted'
              }
            >
              {isGuest ? 'Guest' : quota?.plan === 'pro' ? 'Pro' : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isGuest ? (
            <p className="text-sm text-muted">
              As a guest, your sessions are stored locally in your browser. Create an account to sync across devices.
            </p>
          ) : quotaLoading ? (
            <LoadingSpinner size="sm" />
          ) : quota ? (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Repos analyzed</span>
                <span className="text-white">
                  {quota.quota_used} / {quota.quota_limit}
                </span>
              </div>
              <Progress value={quotaPercent} className="h-2" />

              {quota.plan === 'free' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Upgrade to Pro
                      </p>
                      <p className="text-xs text-muted">
                        Unlimited repo analyses and priority support
                      </p>
                    </div>
                    <Button size="sm" className="gap-2">
                      <Zap className="h-4 w-4" />
                      Upgrade
                    </Button>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Unable to load quota info.</p>
          )}
        </CardContent>
      </Card>

      {/* Sign in prompt for guests */}
      {isGuest && (
        <Card className="border-green/30 bg-green/5">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-white">
                Get more features
              </p>
              <p className="text-xs text-muted">
                Sign in to sync sessions across devices and unlock Pro features
              </p>
            </div>
            <Button size="sm" className="gap-2">
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
