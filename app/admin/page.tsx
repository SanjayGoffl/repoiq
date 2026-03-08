'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, FileText, Brain, Activity } from 'lucide-react';

// Placeholder stats for admin dashboard
const STATS = [
  { label: 'Total Users', value: '—', icon: Users },
  { label: 'Total Sessions', value: '—', icon: FileText },
  { label: 'Concepts Taught', value: '—', icon: Brain },
  { label: 'Active Today', value: '—', icon: Activity },
] as const;

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Badge variant="outline" className="border-red-700 text-red-400">
            Admin
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Platform-wide usage statistics and management
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="border-border bg-navy-light">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green/20">
                <stat.icon className="h-5 w-5 text-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-muted">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Recent sessions placeholder */}
      <Card className="border-border bg-navy-light">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted">
              Session data will appear here once the API is connected.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin actions placeholder */}
      <Card className="border-border bg-navy-light">
        <CardHeader>
          <CardTitle className="text-base text-white">
            Admin Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[100px] items-center justify-center">
            <p className="text-sm text-muted">
              Admin tools (user management, session cleanup, etc.) will be
              available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
