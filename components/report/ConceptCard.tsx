'use client';

import { FileCode, PlayCircle } from 'lucide-react';
import type { Concept } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface ConceptCardProps {
  concept: Concept;
  index: number;
  onStartTeach: (concept: Concept) => void;
}

export function ConceptCard({ concept, index, onStartTeach }: ConceptCardProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value={`concept-${index}`}
        className="rounded-lg border border-border bg-navy-light px-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-3">
            <Badge className="h-6 w-6 shrink-0 items-center justify-center rounded-full p-0 text-xs">
              {index + 1}
            </Badge>
            <span className="text-left font-medium text-white">
              {concept.concept}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <FileCode className="h-4 w-4 shrink-0" />
            <code className="rounded bg-navy px-2 py-0.5 font-mono text-xs text-green">
              {concept.file}:{concept.lines.join('-')}
            </code>
          </div>

          <p className="text-sm leading-relaxed text-muted">
            {concept.why_critical}
          </p>

          <Button
            size="sm"
            className="gap-2"
            onClick={() => onStartTeach(concept)}
          >
            <PlayCircle className="h-4 w-4" />
            Start Learning
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
