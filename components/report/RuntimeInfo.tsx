import { Cpu, HardDrive, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RuntimeRequirements } from '@/lib/types';

interface RuntimeInfoProps {
  runtime: RuntimeRequirements;
}

export function RuntimeInfo({ runtime }: RuntimeInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cpu className="h-5 w-5 text-cyan-400" />
          Runtime Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* RAM Estimate */}
          <div className="rounded-lg border border-border bg-navy p-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <HardDrive className="h-4 w-4" />
              Est. RAM
            </div>
            <p className="mt-1 text-2xl font-bold text-white">
              {runtime.ram_estimate_mb >= 1024
                ? `${(runtime.ram_estimate_mb / 1024).toFixed(1)} GB`
                : `${runtime.ram_estimate_mb} MB`}
            </p>
            <p className="mt-1 text-xs text-muted">{runtime.ram_reasoning}</p>
          </div>

          {/* Runtime Versions */}
          <div className="rounded-lg border border-border bg-navy p-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Settings className="h-4 w-4" />
              Runtimes
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {runtime.runtime_versions.map((rv) => (
                <Badge key={rv.name} variant="secondary">
                  {rv.name} {rv.version}
                </Badge>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="rounded-lg border border-border bg-navy p-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Cpu className="h-4 w-4" />
              System Deps
            </div>
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {runtime.system_requirements.map((req) => (
                <li key={req} className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-green" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
