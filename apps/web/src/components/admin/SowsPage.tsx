'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Search, FileText, MessageSquarePlus, X } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Input } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';

type Status = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED' | 'APPROVED';

type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  project: string;
  status: Status;
  version: number;
  updatedAt: string;
  description: string;
  awaitingApproval?: boolean;
};

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  CHANGES_REQUESTED: 'Changes requested',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
};

const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  IN_REVIEW: 'info',
  CHANGES_REQUESTED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'success',
};

function statusLabelFor(sow: SowRow): string {
  if (sow.awaitingApproval && (sow.status === 'SUBMITTED' || sow.status === 'IN_REVIEW')) {
    return 'Requires your approval';
  }
  return STATUS_LABEL[sow.status];
}

function statusToneFor(sow: SowRow): 'neutral' | 'info' | 'warning' | 'danger' | 'success' {
  if (sow.awaitingApproval && (sow.status === 'SUBMITTED' || sow.status === 'IN_REVIEW')) {
    return 'warning';
  }
  return STATUS_TONE[sow.status];
}

const STATUS_FILTERS: { label: string; value: 'ALL' | Status }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'In review', value: 'IN_REVIEW' },
  { label: 'Changes requested', value: 'CHANGES_REQUESTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Approved', value: 'APPROVED' },
];

const SOWS: SowRow[] = [
  {
    id: 's-1',
    sowNumber: 'SOW-1042',
    title: 'Website revamp — Phase 1',
    project: 'Website revamp',
    status: 'APPROVED',
    version: 2,
    updatedAt: '2026-07-20',
    description: 'Redesign and rebuild of the client-facing marketing site, including a new component library, CMS integration, and a phased content migration from the legacy platform.',
  },
  {
    id: 's-2',
    sowNumber: 'SOW-1051',
    title: 'Data migration plan',
    project: 'Data migration',
    status: 'IN_REVIEW',
    version: 1,
    updatedAt: '2026-07-25',
    description: 'Migration of production data from the legacy on-prem warehouse to the new cloud data platform, covering schema mapping, validation, and a zero-downtime cutover plan.',
  },
  {
    id: 's-3',
    sowNumber: 'SOW-1055',
    title: 'Support retainer renewal',
    project: 'Support retainer',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-07-27',
    description: 'Renewal of the ongoing monthly support retainer covering bug fixes, minor enhancements, and on-call incident response for the client\'s existing platform.',
  },
  {
    id: 's-4',
    sowNumber: 'SOW-1048',
    title: 'Phase 2 scope addendum',
    project: 'Website revamp',
    status: 'CHANGES_REQUESTED',
    version: 1,
    updatedAt: '2026-07-18',
    description: 'Addendum covering additional Phase 2 deliverables for the website revamp, including a client portal login and account management screens not in the original scope.',
  },
  {
    id: 's-5',
    sowNumber: 'SOW-1060',
    title: 'Cloud infrastructure migration',
    project: 'Cloud migration',
    status: 'SUBMITTED',
    version: 1,
    updatedAt: '2026-07-29',
    description: 'Migration of core services to the new cloud infrastructure provider, including networking setup, security hardening, and a phased service cutover. Awaiting participant approval before work begins.',
    awaitingApproval: true,
  },
];

type ReviewerComment = {
  id: string;
  author: string;
  initials: string;
  text: string;
  postedAt: string;
  sectionKey?: string;
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

type TemplateDoc = {
  title: string;
  clauses: { key: string; heading: string; body: string[] }[];
};

const TEMPLATE_DOC: TemplateDoc = {
  title: 'Statement of Work — Template',
  clauses: [
    {
      key: 'overview',
      heading: '1. Overview',
      body: [
        'This Statement of Work ("SOW") is entered into between the Consultant and the Client, and is governed by the terms of the Master Services Agreement between the parties.',
      ],
    },
    {
      key: 'scope',
      heading: '2. Scope of Work',
      body: [
        'The Consultant shall provide the services described below, including all associated planning, execution, and reporting activities required to meet the stated objectives.',
        'Any work outside this scope shall require a written change order signed by both parties.',
      ],
    },
    {
      key: 'deliverables',
      heading: '3. Deliverables',
      body: [
        '• Discovery & requirements document',
        '• Implementation of agreed scope items',
        '• Testing and quality assurance sign-off',
        '• Final handover documentation',
      ],
    },
    {
      key: 'timeline',
      heading: '4. Timeline',
      body: ['Estimated duration: 6–8 weeks from kickoff, subject to client feedback turnaround times.'],
    },
    {
      key: 'fees',
      heading: '5. Fees & Payment Terms',
      body: [
        'Fees are billed monthly in arrears based on the agreed rate card. Invoices are payable within 15 days of receipt.',
      ],
    },
    {
      key: 'terms',
      heading: '6. Terms & Conditions',
      body: [
        'This SOW is subject to the confidentiality, IP assignment, and termination clauses set out in the Master Services Agreement.',
      ],
    },
  ],
};

function clauseByKey(key: string) {
  return TEMPLATE_DOC.clauses.find((c) => c.key === key);
}

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
  const [sows, setSows] = useState<SowRow[]>(SOWS);
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ReviewerComment[]>>(COMMENTS_BY_SOW);
  const [commentDraft, setCommentDraft] = useState('');
  const [taggedSectionKey, setTaggedSectionKey] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);

  const selectedSow = sows.find((s) => s.id === selectedSowId) ?? null;

  function closeSidebar() {
    setSelectedSowId(null);
    setCommentDraft('');
    setTaggedSectionKey(null);
  }

  function openSidebar(id: string) {
    setSelectedSowId(id);
    setCommentDraft('');
    setTaggedSectionKey(null);
  }

  function logComment(sowId: string, text: string, sectionKey?: string | null) {
    const comment: ReviewerComment = {
      id: `c-${Date.now()}`,
      author: 'Admin User',
      initials: 'AY',
      text,
      postedAt: 'Just now',
      ...(sectionKey ? { sectionKey } : {}),
    };
    setComments((prev) => ({ ...prev, [sowId]: [...(prev[sowId] ?? []), comment] }));
  }

  function handlePostReply() {
    if (!selectedSow || !commentDraft.trim()) return;
    logComment(selectedSow.id, commentDraft.trim(), taggedSectionKey);
    setCommentDraft('');
    setTaggedSectionKey(null);
  }

  function handleDecision(sowId: string, newStatus: Status, actionLabel: string) {
    if (!commentDraft.trim()) return;
    logComment(sowId, `${actionLabel}: ${commentDraft.trim()}`, taggedSectionKey);
    setSows((prev) => prev.map((s) => (s.id === sowId ? { ...s, status: newStatus } : s)));
    setCommentDraft('');
    setTaggedSectionKey(null);
  }

  const visible = sows.filter(
    (s) =>
      (statusFilter === 'ALL' || s.status === statusFilter) &&
      (s.sowNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.project.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="SOWs"
          description="Statements of Work across your organization's projects."
          actions={
            !hideCreateButton && (
              <Button onClick={() => router.push('/tenantSlug/admin/sows/new')}>
                <Plus className="h-4 w-4" />
                New SOW
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
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Right sidebar: template doc — pushes content left, no overlay */}
      <div
        className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out -mt-6 -mb-6 -mr-6"
        style={{ width: selectedSow ? sidebarWidth : 0, opacity: selectedSow ? 1 : 0 }}
      >
        {selectedSow && (
          <div
            className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col border-l border-border bg-muted/40"
            style={{ width: sidebarWidth }}
          >
            <ResizeHandle onPointerDown={startResize} />
            <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedSow.sowNumber}</h2>
                <p className="text-sm text-muted-foreground">{selectedSow.title}</p>
              </div>
              <button
                type="button"
                onClick={closeSidebar}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Status</h3>
                  <Badge tone={statusToneFor(selectedSow)}>{statusLabelFor(selectedSow)}</Badge>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Project</h3>
                  <p className="text-sm font-medium text-foreground">{selectedSow.project}</p>
                </div>
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

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Template Document</h3>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h4 className="text-base font-semibold text-foreground mb-4">{TEMPLATE_DOC.title}</h4>
                  <div className="space-y-4">
                    {TEMPLATE_DOC.clauses.map((clause) => (
                      <div
                        key={clause.key}
                        className={`group/clause -mx-2 rounded-md px-2 py-1 ${
                          taggedSectionKey === clause.key ? 'bg-primary/5 ring-1 ring-primary/30' : ''
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <h5 className="text-sm font-medium text-foreground">{clause.heading}</h5>
                          <button
                            type="button"
                            onClick={() => setTaggedSectionKey(clause.key)}
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/clause:opacity-100"
                          >
                            <MessageSquarePlus className="h-3.5 w-3.5" />
                            Comment
                          </button>
                        </div>
                        {clause.body.map((line, i) => (
                          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                            {line}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
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
                          {comment.sectionKey && clauseByKey(comment.sectionKey) && (
                            <button
                              type="button"
                              onClick={() => setTaggedSectionKey(comment.sectionKey!)}
                              className="mb-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/20"
                            >
                              § {clauseByKey(comment.sectionKey)!.heading}
                            </button>
                          )}
                          <p className="text-sm text-foreground">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {taggedSectionKey && clauseByKey(taggedSectionKey) && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-full bg-primary/10 py-0.5 pl-2.5 pr-1 text-xs font-medium text-primary w-fit">
                    Commenting on: {clauseByKey(taggedSectionKey)!.heading}
                    <button
                      type="button"
                      onClick={() => setTaggedSectionKey(null)}
                      className="rounded-full p-0.5 hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <textarea
                  placeholder={taggedSectionKey ? `Comment on ${clauseByKey(taggedSectionKey)?.heading ?? 'this section'}...` : 'Reply to comments...'}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  className="mt-3 w-full rounded-md border border-border bg-card p-3 text-sm focus:border-primary focus:bg-background focus:outline-none min-h-25 resize-none"
                />
                <Button className="w-full mt-3" disabled={!commentDraft.trim()} onClick={handlePostReply}>
                  Post Reply
                </Button>
              </div>
            </div>

            {selectedSow.awaitingApproval && selectedSow.status !== 'APPROVED' && selectedSow.status !== 'REJECTED' ? (
              <div className="border-t border-border p-4 shrink-0 space-y-2">
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
                    variant="ghost"
                    disabled={!commentDraft.trim()}
                    onClick={() => handleDecision(selectedSow.id, 'IN_REVIEW', 'Review')}
                  >
                    Review
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={!commentDraft.trim()}
                    onClick={() => handleDecision(selectedSow.id, 'REJECTED', 'Rejected')}
                  >
                    Reject
                  </Button>
                  <Button disabled={!commentDraft.trim()} onClick={() => handleDecision(selectedSow.id, 'APPROVED', 'Approved')}>
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
                <Button variant="ghost" onClick={closeSidebar}>
                  Close
                </Button>
                <Button>Edit Document</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
