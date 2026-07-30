'use client';

import { useState } from 'react';
import { Search, FileText, Play, Check, X, Printer } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Input } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';
import { useTemplateStore } from '../admin/sows/templateStore';
import { LivePreview } from '../admin/sows/builder/LivePreview';
import { FormValuesDocument } from '../admin/sows/builder/FormValuesDocument';
import { useSowStore } from '../admin/sows/sowStore';
import { type SowRow, type SowStatus } from '../admin/sows/sowData';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In review',
  CHANGES_REQUESTED: 'Changes requested',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
};

const STATUS_TONE: Record<string, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  IN_REVIEW: 'info',
  CHANGES_REQUESTED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'success',
  PUBLISHED: 'success',
};

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Changes requested', value: 'CHANGES_REQUESTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Published', value: 'PUBLISHED' },
];

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function SowsYardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusQuery = searchParams.get('status');
  const statusFilter = (statusQuery as 'ALL' | string) || 'ALL';

  const setStatusFilter = (val: 'ALL' | string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', val);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const sows = useSowStore((s) => s.sows);
  const [search, setSearch] = useState('');
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);
  const templates = useTemplateStore((s) => s.templates);

  const selectedSow = sows.find((s) => s.id === selectedSowId) ?? null;
  const selectedTemplate = selectedSow ? templates.find((t) => t.id === selectedSow.templateId) : undefined;

  const visible = sows.filter(
    (s) =>
      (statusFilter === 'ALL' || s.status === statusFilter) &&
      (s.sowNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.project.toLowerCase().includes(search.toLowerCase())),
  );

  function openSidebar(id: string) {
    setSelectedSowId(id);
  }

  function closeSidebar() {
    setSelectedSowId(null);
  }

  function handlePublish(sow: SowRow) {
    const segments = pathname.split('/').filter(Boolean);
    const basePath = segments.length >= 2 ? `/${segments[0]}/${segments[1]}` : '/tenantSlug/participant';
    router.push(`${basePath}/workflows/yard`);
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="SOWs Yard"
          description="Statements of Work created by your organization — fill them in and publish."
        />

        {publishedMessage && (
          <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <span className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              {publishedMessage}
            </span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => setPublishedMessage(null)}
              className="shrink-0 rounded p-1 hover:bg-emerald-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SOWs..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 gap-y-1 rounded-lg border border-border bg-muted/40 p-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {visible.length} SOW{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {visible.length === 0 ? (
          <EmptyState message={search || statusFilter !== 'ALL' ? 'No SOWs match your filters' : 'No SOWs yet'} />
        ) : (
          <Table>
            <TableHead>
              <Th>SOW</Th>
              <Th>Project</Th>
              <Th>Status</Th>
              <Th>Version</Th>
              <Th>Updated</Th>
              <Th className="text-right">Actions</Th>
            </TableHead>
            <TableBody>
              {visible.map((sow) => (
                <tr
                  key={sow.id}
                  className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                    selectedSow?.id === sow.id ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => openSidebar(sow.id)}
                >
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{sow.sowNumber}</div>
                        <div className="text-xs text-muted-foreground">{sow.title}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{sow.project}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[sow.status]}>{STATUS_LABEL[sow.status]}</Badge>
                  </Td>
                  <Td className="text-muted-foreground">v{sow.version}</Td>
                  <Td className="text-muted-foreground">{sow.updatedAt}</Td>
                  <Td className="text-right">
                    {sow.status === 'DRAFT' && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePublish(sow);
                        }}
                      >
                        <Play className="h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div
        className={`w-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out md:shrink-0 md:-mt-6 md:-mb-6 md:-mr-6 ${selectedSow ? 'md:w-[var(--panel-w)]' : 'md:w-0'}`}
        style={{ ['--panel-w' as any]: `${sidebarWidth}px`, opacity: selectedSow ? 1 : 0 }}
      >
        {selectedSow && (
          <div
            data-print-area
            className="fixed inset-0 z-40 overflow-y-auto bg-background p-4 md:sticky md:top-14 md:inset-auto md:z-auto md:flex md:h-[calc(100vh-3.5rem)] md:w-[var(--panel-w)] md:flex-col md:border-l md:border-border md:bg-muted/40 md:p-0"
          >
            <ResizeHandle onPointerDown={startResize} className="hidden md:block no-print" />
            <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedSow.sowNumber}</h2>
                <p className="text-sm text-muted-foreground">{selectedSow.title}</p>
              </div>
              <div className="flex items-center gap-1 no-print">
                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Export to PDF
                </Button>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Version</h3>
                  <p className="text-sm font-medium text-foreground">v{selectedSow.version}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Last Updated</h3>
                  <p className="text-sm font-medium text-foreground">{selectedSow.updatedAt}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Description</h3>
                <p className="text-sm leading-relaxed text-foreground">{selectedSow.description}</p>
              </div>

              <div className="border-t border-border pt-6 no-print">
                <h3 className="text-sm font-semibold text-foreground mb-4">Form Preview</h3>
                {selectedTemplate ? (
                  <LivePreview
                    key={selectedSow.id}
                    schema={selectedTemplate.jsonSchema}
                    uiSchema={selectedTemplate.uiSchema}
                    defaultValues={{}}
                  />
                ) : (
                  <EmptyState message="No template linked to this SOW" />
                )}
              </div>

              <div className="hidden border-t border-border pt-6 print:block">
                <h3 className="text-sm font-semibold text-foreground mb-4">Form Values</h3>
                {selectedTemplate ? (
                  <FormValuesDocument schema={selectedTemplate.jsonSchema} formData={{}} />
                ) : (
                  <p className="text-sm text-muted-foreground">No template linked to this SOW</p>
                )}
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0 no-print">
              <Button variant="ghost" onClick={closeSidebar}>
                Close
              </Button>
              {selectedSow.status === 'DRAFT' && (
                <Button onClick={() => handlePublish(selectedSow)}>
                  <Play className="h-4 w-4" />
                  Publish
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
