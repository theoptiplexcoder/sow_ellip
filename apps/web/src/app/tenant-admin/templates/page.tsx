'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FileText, Layers, Pencil, Upload } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { NewTemplateButton } from '@/components/tenant-admin/new-template-button';
import { TemplateExportActions } from '@/components/tenant-admin/template-export-actions';
import {
  Template,
  createTemplate,
  hasPlaceholders,
  templates,
} from '@/lib/data/templates';
import { parseDocxFile } from '@/lib/docx/parse-docx';

type Filter = 'all' | 'structured' | 'docx';

export default function TemplatesPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [uploading, setUploading] = useState(false);
  const [templateList, setTemplateList] = useState<Template[]>(templates);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const structuredCount = templateList.filter(hasPlaceholders).length;
  const docxCount = templateList.length - structuredCount;

  const visible = useMemo(() => {
    if (filter === 'structured') return templateList.filter(hasPlaceholders);
    if (filter === 'docx')
      return templateList.filter((t) => !hasPlaceholders(t));
    return templateList;
  }, [filter, templateList]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const { html, placeholders } = await parseDocxFile(file);
      const fileUrl = URL.createObjectURL(file);

      createTemplate(file.name, html, placeholders, fileUrl);
      setTemplateList([...templates]);
      toast.success(
        placeholders.length > 0
          ? `Uploaded — ${placeholders.length} placeholder${placeholders.length === 1 ? '' : 's'} detected`
          : 'Uploaded — no placeholders detected',
      );
    } catch {
      toast.error('Could not upload template — check the file and try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="One library, auto-sorted: documents with {{placeholders}} are Structured, documents without are plain DOCX. Editing a template never retroactively changes an already-generated SOW."
        actions={
          <NewTemplateButton
            onCreated={() => setTemplateList([...templates])}
          />
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
      <div
        className={cn(
          'mb-6 flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center transition-colors hover:border-primary',
          uploading && 'pointer-events-none opacity-60',
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleUpload(file);
        }}
        role="button"
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">
          {uploading
            ? 'Uploading…'
            : 'Drag a .docx file here, or click to upload'}
        </p>
        <p className="text-xs text-muted-foreground">
          Placeholders are extracted automatically — it's filed as Structured or
          DOCX based on what's found.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All{' '}
          <span className="text-muted-foreground">{templateList.length}</span>
        </FilterButton>
        <FilterButton
          active={filter === 'structured'}
          onClick={() => setFilter('structured')}
        >
          <Layers className="size-3.5" /> Structured{' '}
          <span className="text-muted-foreground">{structuredCount}</span>
        </FilterButton>
        <FilterButton
          active={filter === 'docx'}
          onClick={() => setFilter('docx')}
        >
          <FileText className="size-3.5" /> DOCX{' '}
          <span className="text-muted-foreground">{docxCount}</span>
        </FilterButton>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No templates in this filter yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => {
            const structured = hasPlaceholders(t);
            return (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="min-w-0 text-base">
                      <Link
                        href={`/tenant-admin/templates/${t.id}`}
                        className="block truncate hover:underline"
                      >
                        {t.name}
                      </Link>
                    </CardTitle>
                    <Badge
                      variant={t.status === 'active' ? 'default' : 'outline'}
                      className="shrink-0"
                    >
                      {t.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                    <Badge
                      variant={structured ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      {structured ? (
                        <Layers className="size-3" />
                      ) : (
                        <FileText className="size-3" />
                      )}
                      {structured ? 'Structured' : 'DOCX'}
                    </Badge>
                    <span>
                      v{t.version} · updated {t.updatedAt}
                    </span>
                  </div>

                  {structured ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.placeholders.map((p) => (
                        <Badge
                          key={p}
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {p}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      No placeholders — static document.
                    </p>
                  )}

                  <Accordion className="mt-3">
                    <AccordionItem value="versions">
                      <AccordionTrigger className="text-sm">
                        Version history
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="flex flex-col gap-1.5 text-xs">
                          {t.versions.map((v) => (
                            <li
                              key={v.version}
                              className="flex items-center justify-between"
                            >
                              <span>
                                v{v.version} · {v.note}
                              </span>
                              <span className="text-muted-foreground">
                                {v.uploadedAt}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/tenant-admin/templates/${t.id}`} />}
                    >
                      <Pencil className="size-3.5" />
                      Edit in product
                    </Button>
                    <TemplateExportActions templateName={t.name} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
