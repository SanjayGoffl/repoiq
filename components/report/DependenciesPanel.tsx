'use client';

import { useState } from 'react';
import { Package, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Dependency } from '@/lib/types';

interface DependenciesPanelProps {
  dependencies: Dependency[];
}

export function DependenciesPanel({ dependencies }: DependenciesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group by source file
  const grouped: Record<string, Dependency[]> = {};
  for (const dep of dependencies) {
    const key = dep.source_file;
    if (!grouped[key]) grouped[key] = [];
    grouped[key]!.push(dep);
  }

  const prodCount = dependencies.filter((d) => d.type === 'production').length;
  const devCount = dependencies.filter((d) => d.type === 'dev').length;

  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center gap-2"
        >
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-orange-400" />
            Dependencies
            <span className="ml-2 text-sm font-normal text-muted">
              {prodCount} prod, {devCount} dev
            </span>
          </CardTitle>
          <ChevronDown
            className={`ml-auto h-4 w-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            {Object.entries(grouped).map(([sourceFile, deps]) => (
              <div key={sourceFile}>
                <p className="mb-2 text-xs font-medium text-muted">
                  {sourceFile}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {deps.map((dep) => (
                    <Badge
                      key={`${dep.name}-${dep.source_file}`}
                      variant={dep.type === 'production' ? 'default' : 'secondary'}
                      className="font-mono text-xs"
                    >
                      {dep.name}
                      <span className="ml-1 opacity-60">{dep.version}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
