'use client';

import { useState } from 'react';
import { Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportPDFButton() {
  const [preparing, setPreparing] = useState(false);

  const handleExport = () => {
    setPreparing(true);
    // Brief delay to let state update and any animations settle
    setTimeout(() => {
      window.print();
      setPreparing(false);
    }, 300);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={preparing}
      className="gap-1.5 print:hidden"
    >
      {preparing ? (
        <FileDown className="h-4 w-4 animate-pulse" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {preparing ? 'Preparing...' : 'Download PDF'}
    </Button>
  );
}
