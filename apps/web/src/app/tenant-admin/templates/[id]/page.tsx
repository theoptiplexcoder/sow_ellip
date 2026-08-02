'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DocxEditorTemplateEditor } from '@/components/tenant-admin/docx-editor-template-editor';
import { TemplateExportActions } from '@/components/tenant-admin/template-export-actions';
import { getTemplate, hasPlaceholders } from '@/lib/data/templates';

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const template = getTemplate(id);
  if (!template) notFound();

  return (
    <div>
      <Link
        href="/tenant-admin/templates"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Templates
      </Link>
      <PageHeader
        title={template.name}
        description="Edit this template's document directly in the product — update content and save a new version."
        actions={
          <>
            <Badge variant={hasPlaceholders(template) ? 'default' : 'outline'}>
              {hasPlaceholders(template) ? 'Structured' : 'DOCX'}
            </Badge>
            <Badge
              variant={template.status === 'active' ? 'default' : 'outline'}
            >
              {template.status}
            </Badge>
            <Badge variant="outline">v{template.version}</Badge>
          </>
        }
      />

      <div className="mb-6">
        <TemplateExportActions template={template} />
      </div>

      <DocxEditorTemplateEditor
        templateId={template.id}
        name={template.name}
        fileUrl={template.fileUrl}
        bodyHtml={template.bodyHtml}
        placeholders={template.placeholders}
      />

      <p className="mt-6 text-xs text-muted-foreground">
        A generated SOW stores which template version it came from — not a live
        link to this document.
      </p>
    </div>
  );
}
