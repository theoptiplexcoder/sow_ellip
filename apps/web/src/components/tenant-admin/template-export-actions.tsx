'use client';

import { toast } from 'sonner';
import { FileDown, FileText } from 'lucide-react';
import { Button } from '@sow-platform/ui';

export function TemplateExportActions({
  templateName,
}: {
  templateName: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success(`Exported "${templateName}" to PDF (prototype only)`)
        }
      >
        <FileDown className="size-4" />
        Export to PDF
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success(`Exported "${templateName}" as DOCX (prototype only)`)
        }
      >
        <FileText className="size-4" />
        Export as DOCX
      </Button>
    </div>
  );
}
