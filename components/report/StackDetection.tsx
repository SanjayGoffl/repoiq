'use client';

import { Layers, Package, Database, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StackInfo } from '@/lib/types';

interface StackDetectionProps {
  stackInfo: StackInfo;
}

const CATEGORIES = [
  { key: 'frameworks' as const, label: 'Frameworks', icon: Layers, color: 'text-blue-400' },
  { key: 'libraries' as const, label: 'Libraries', icon: Package, color: 'text-purple-400' },
  { key: 'databases' as const, label: 'Databases', icon: Database, color: 'text-yellow-400' },
  { key: 'tools' as const, label: 'Tools', icon: Wrench, color: 'text-green' },
];

export function StackDetection({ stackInfo }: StackDetectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-blue-400" />
          Tech Stack
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map(({ key, label, icon: Icon, color }) => {
            const items = stackInfo[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-white">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
