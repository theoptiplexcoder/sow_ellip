'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { Download, FileDown, FileText } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sow-platform/ui';
import type { Template } from '@/lib/data/templates';
import { generateDocxBlob, downloadBlob } from '@/lib/docx/generate-docx';

export function TemplateExportActions({
  template,
}: {
  template: Pick<Template, 'id' | 'name' | 'bodyHtml'>;
}) {
  async function handleExportDocx() {
    const blob = await generateDocxBlob(template.bodyHtml);
    downloadBlob(blob, `${template.name.replace(/\.docx$/i, '')}.docx`);
    toast.success(`Exported "${template.name}" as DOCX`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <Download className="size-3.5" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          render={
            <Link
              href={`/tenant-admin/templates/${template.id}/print`}
              target="_blank"
            />
          }
        >
          <FileDown className="size-4" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDocx}>
          <FileText className="size-4" />
          Export as DOCX
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
