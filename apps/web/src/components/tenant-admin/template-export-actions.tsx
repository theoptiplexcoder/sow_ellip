'use client';

import { toast } from 'sonner';
import { Download, FileDown, FileText } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sow-platform/ui';

export function TemplateExportActions({
  templateName,
}: {
  templateName: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Download className="size-3.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() =>
            toast.success(`Exported "${templateName}" to PDF (prototype only)`)
          }
        >
          <FileDown className="size-4" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            toast.success(`Exported "${templateName}" as DOCX (prototype only)`)
          }
        >
          <FileText className="size-4" />
          Export as DOCX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
