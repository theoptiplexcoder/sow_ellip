'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Search, FileText, MoreHorizontal, Printer, History } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Input } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';
import { useTemplateStore } from './sows/templateStore';
import { FormValuesDocument } from './sows/builder/FormValuesDocument';
import { useSowStore } from './sows/sowStore';
import { type SowRow, type SowStatus as Status } from './sows/sowData';
import { getVersionHistory } from './sows/sowVersionHistory';
import { VersionHistoryDialog } from './sows/VersionHistoryDialog';

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes requested',
};

const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  APPROVED: 'success',
  CHANGES_REQUESTED: 'warning',
};

function requiresApproval(sow: SowRow): boolean {
  return !!sow.awaitingApproval && sow.status === 'DRAFT';
}

function statusLabelFor(sow: SowRow): string {
  return requiresApproval(sow) ? 'Requires approval' : STATUS_LABEL[sow.status];
}

function statusToneFor(sow: SowRow): 'neutral' | 'info' | 'warning' | 'danger' | 'success' {
  return requiresApproval(sow) ? 'warning' : STATUS_TONE[sow.status];
}

const STATUS_FILTERS: { label: string; value: 'ALL' | Status }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
];

type ReviewerComment = {
  id: string;
  author: string;
  initials: string;
  text: string;
  postedAt: string;
};

const COMMENTS_BY_SOW: Record<string, ReviewerComment[]> = {
  's-4': [
    {
      id: 'c-1',
      author: 'Alex Johnson',
      initials: 'AJ',
      text: 'Please update Section 3 to include the specific deliverables we discussed for Phase 1. The current wording is too ambiguous and needs clarification on the timeline.',
      postedAt: '2h ago',
    },
    {
      id: 'c-2',
      author: 'Admin User',
      initials: 'AY',
      text: 'Also, Section 5 should explicitly state that payment is net 30, not net 15 as currently written.',
      postedAt: '1h ago',
    },
  ],
};

interface SowsPageProps {
  hideCreateButton?: boolean;
}

export function SowsPage({ hideCreateButton = false }: SowsPageProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusQuery = searchParams.get('status');
  const statusFilter = (statusQuery as 'ALL' | Status) || 'ALL';

  const setStatusFilter = (val: 'ALL' | Status) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', val);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const [search, setSearch] = useState('');
  const sows = useSowStore((s) => s.sows);
  const setSowStatus = useSowStore((s) => s.setStatus);
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ReviewerComment[]>>(COMMENTS_BY_SOW);
  const [commentDraft, setCommentDraft] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);
  const templates = useTemplateStore((s) => s.templates);

  const selectedSow = sows.find((s) => s.id === selectedSowId) ?? null;
  const selectedTemplate = selectedSow ? templates.find((t) => t.id === selectedSow.templateId) : undefined;

  function closeSidebar() {
    setSelectedSowId(null);
    setCommentDraft('');
  }

  function openSidebar(id: string) {
    setSelectedSowId(id);
    setCommentDraft('');
  }

  function editDocument(sowId: string) {
    router.push(`/tenantSlug/admin/sows/edit?id=${sowId}`);
  }

  function logComment(sowId: string, text: string) {
    const comment: ReviewerComment = {
      id: `c-${Date.now()}`,
      author: 'Admin User',
      initials: 'AY',
      text,
      postedAt: 'Just now',
    };
    setComments((prev) => ({ ...prev, [sowId]: [...(prev[sowId] ?? []), comment] }));
  }

  function handlePostReply() {
    if (!selectedSow || !commentDraft.trim()) return;
    logComment(selectedSow.id, commentDraft.trim());
    setCommentDraft('');
  }

  function handleDecision(sowId: string, newStatus: Status, actionLabel: string) {
    if (!commentDraft.trim()) return;
    logComment(sowId, `${actionLabel}: ${commentDraft.trim()}`);
    setSowStatus(sowId, newStatus);
    setCommentDraft('');
  }

  function handlePublishSow(sowId: string) {
    setSowStatus(sowId, 'PUBLISHED');
  }

  const visible = sows.filter(
    (s) =>
      (statusFilter === 'ALL' || s.status === statusFilter) &&
      (s.sowNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.project.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="SOWs"
          description="Statements of Work across your organization's projects."
          actions={
            !hideCreateButton && (
              <Button onClick={() => router.push('/tenantSlug/admin/sows/new')}>
                <Plus className="h-4 w-4" />
                New SOW Template
              </Button>
            )
          }
        />

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
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
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
              <Th><span className="sr-only">Actions</span></Th>
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
                    <Badge tone={statusToneFor(sow)}>{statusLabelFor(sow)}</Badge>
                  </Td>
                  <Td className="text-muted-foreground">v{sow.version}</Td>
                  <Td className="text-muted-foreground">{sow.updatedAt}</Td>
                  <Td className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0" id={`sow-actions-${sow.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {sow.status === 'DRAFT' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePublishSow(sow.id); }}>
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            editDocument(sow.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); }}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Right sidebar: template doc — pushes content left, no overlay */}
      <div
        className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out w-0 md:w-[var(--panel-w)] md:-mt-6 md:-mb-6 md:-mr-6"
        style={{ ['--panel-w' as any]: selectedSow ? `${sidebarWidth}px` : '0px', opacity: selectedSow ? 1 : 0 }}
      >
        {selectedSow && (
          <div
            data-print-area
            className="fixed inset-0 z-40 flex flex-col bg-background md:sticky md:top-14 md:inset-auto md:z-auto md:h-[calc(100vh-3.5rem)] md:w-[var(--panel-w)] md:border-l md:border-border md:bg-muted/40"
            style={{ ['--panel-w' as any]: `${sidebarWidth}px` }}
          >
            <ResizeHandle onPointerDown={startResize} className="hidden md:block no-print" />
            <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedSow.sowNumber}</h2>
                <p className="text-sm text-muted-foreground">{selectedSow.title}</p>
              </div>
              <div className="flex items-center gap-1 no-print">
                <Button variant="ghost" size="sm" onClick={() => setShowVersionHistory(true)}>
                  <History className="h-4 w-4" />
                  Version History
                </Button>
                <Button variant="ghost" size="sm" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Export to PDF
                </Button>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                  <FormValuesDocument schema={selectedTemplate.jsonSchema} formData={selectedSow.formData ?? {}} />
                ) : (
                  <EmptyState message="No template linked to this SOW" />
                )}
              </div>

              <div className="hidden border-t border-border pt-6 print:block">
                {selectedTemplate ? (
                  <FormValuesDocument schema={selectedTemplate.jsonSchema} formData={selectedSow.formData ?? {}} />
                ) : (
                  <p className="text-sm text-muted-foreground">No template linked to this SOW</p>
                )}
              </div>

              <div className="border-t border-border pt-6 no-print">
                <h3 className="text-sm font-semibold text-foreground mb-4">Reviewer Comments</h3>
                {(() => {
                  const sowComments = comments[selectedSow.id] ?? [];
                  if (sowComments.length === 0) {
                    return (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center">
                        <p className="text-sm font-medium text-foreground">No Comments Yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reviewer feedback on this SOW will show up here.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {sowComments.map((comment, i) => (
                        <div
                          key={comment.id}
                          className={
                            i === 0
                              ? 'rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20'
                              : 'rounded-lg border border-border bg-card p-3'
                          }
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={
                                i === 0
                                  ? 'h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold dark:bg-amber-900 dark:text-amber-300'
                                  : 'h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold dark:bg-blue-900 dark:text-blue-300'
                              }
                            >
                              {comment.initials}
                            </div>
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{comment.postedAt}</span>
                          </div>
                          <p className="text-sm text-foreground">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <textarea
                  placeholder="Reply to comments..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  className="mt-3 w-full rounded-md border border-border bg-card p-3 text-sm focus:border-primary focus:bg-background focus:outline-none min-h-25 resize-none"
                />
                <Button className="w-full mt-3" disabled={!commentDraft.trim()} onClick={handlePostReply}>
                  Post Reply
                </Button>
              </div>
            </div>

            {requiresApproval(selectedSow) ? (
              <div className="border-t border-border p-4 shrink-0 space-y-2 no-print">
                {!commentDraft.trim() && (
                  <p className="text-xs text-muted-foreground">
                    Log a comment above before you can review, approve, or reject this SOW.
                  </p>
                )}
                <div className="flex items-center justify-end gap-3">
                  <Button variant="ghost" onClick={closeSidebar}>
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!commentDraft.trim()}
                    onClick={() => handleDecision(selectedSow.id, 'CHANGES_REQUESTED', 'Changes requested')}
                  >
                    Changes Requested
                  </Button>
                  <Button disabled={!commentDraft.trim()} onClick={() => handleDecision(selectedSow.id, 'APPROVED', 'Approved')}>
                    Approved
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0 no-print">
                <Button variant="ghost" onClick={closeSidebar}>
                  Close
                </Button>
                <Button onClick={() => editDocument(selectedSow.id)}>Edit Document</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedSow && (
        <VersionHistoryDialog
          open={showVersionHistory}
          onOpenChange={setShowVersionHistory}
          sowNumber={selectedSow.sowNumber}
          entries={getVersionHistory(selectedSow.id)}
        />
      )}
    </div>
  );
}
