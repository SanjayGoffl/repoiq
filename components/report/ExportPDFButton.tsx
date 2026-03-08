'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportPDFButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="gap-1.5 print:hidden"
    >
      <Download className="h-4 w-4" />
      Download PDF
    </Button>
  );
}
