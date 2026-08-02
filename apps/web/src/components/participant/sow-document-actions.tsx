'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { FileDown, FileText } from 'lucide-react';
import { Button } from '@sow-platform/ui';
import { downloadBlob, generateDocxBlob } from '@/lib/docx/generate-docx';
import { sowToHtml } from '@/lib/docx/sow-to-html';
import type { Sow } from '@/lib/data/sows';

export function SowDocumentActions({ sow }: { sow: Sow }) {
  async function handleExportDocx() {
    try {
      const blob = await generateDocxBlob(sowToHtml(sow));
      downloadBlob(blob, `${sow.number}.docx`);
      toast.success('DOCX downloaded');
    } catch {
      toast.error('Could not export DOCX — try again.');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href={`/sows/${sow.id}/print`} target="_blank" />}
      >
        <FileDown className="size-4" />
        Export as PDF
      </Button>
      <Button variant="outline" onClick={handleExportDocx}>
        <FileText className="size-4" />
        Export as DOCX
      </Button>
    </div>
  );
}
