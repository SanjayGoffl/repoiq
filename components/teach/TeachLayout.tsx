'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface TeachLayoutProps {
  children: React.ReactNode;
  codePanel: React.ReactNode;
}

export function TeachLayout({ children, codePanel }: TeachLayoutProps) {
  return (
    <>
      {/* Desktop: side-by-side split */}
      <div className="hidden min-h-[calc(100vh-4rem)] md:grid md:grid-cols-2">
        <div className="border-r border-white/10 bg-navy-light">
          {codePanel}
        </div>
        <div className="bg-navy">{children}</div>
      </div>

      {/* Mobile: tabbed layout */}
      <div className="block min-h-[calc(100vh-4rem)] md:hidden">
        <Tabs defaultValue="code" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-2 grid w-auto grid-cols-2">
            <TabsTrigger value="code">Code</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>

          <TabsContent
            value="code"
            className="flex-1 overflow-hidden bg-navy-light"
          >
            {codePanel}
          </TabsContent>

          <TabsContent
            value="chat"
            className="flex-1 overflow-hidden bg-navy"
          >
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
