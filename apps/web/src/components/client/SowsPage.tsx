'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, FileText, MessageSquarePlus, X, Printer } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Input } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { PrintHeader } from '../ui/print-header';
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

const STATUS_FILTERS: { label: string; value: 'ALL' | Status }[] = [
  { label: 'All', value: 'ALL' },
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
    id: 's-4',
    sowNumber: 'SOW-1048',
    title: 'Phase 2 scope addendum',
    project: 'Website revamp',
    status: 'CHANGES_REQUESTED',
    version: 1,
    updatedAt: '2026-07-18',
    description: 'Addendum covering additional Phase 2 deliverables for the website revamp, including a client portal login and account management screens not in the original scope.',
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

export function SowsPage() {
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
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ReviewerComment[]>>(COMMENTS_BY_SOW);
  const [commentDraft, setCommentDraft] = useState('');
  const [taggedSectionKey, setTaggedSectionKey] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);

  const selectedSow = SOWS.find((s) => s.id === selectedSowId) ?? null;

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

  function handlePostReply() {
    if (!selectedSow || !commentDraft.trim()) return;
    const comment: ReviewerComment = {
      id: `c-${Date.now()}`,
      author: 'You',
      initials: 'YO',
      text: commentDraft.trim(),
      postedAt: 'Just now',
      ...(taggedSectionKey ? { sectionKey: taggedSectionKey } : {}),
    };
    setComments((prev) => ({ ...prev, [selectedSow.id]: [...(prev[selectedSow.id] ?? []), comment] }));
    setCommentDraft('');
    setTaggedSectionKey(null);
  }

  const visible = SOWS.filter(
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
          description="Statements of Work for your projects."
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
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
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
                    <Badge tone={STATUS_TONE[sow.status]}>{STATUS_LABEL[sow.status]}</Badge>
                  </Td>
                  <Td className="text-muted-foreground">v{sow.version}</Td>
                  <Td className="text-muted-foreground">{sow.updatedAt}</Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div
        className="w-0 shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out md:w-[var(--panel-w)] md:-mt-6 md:-mb-6 md:-mr-6"
        style={{ ['--panel-w' as any]: `${selectedSow ? sidebarWidth : 0}px`, opacity: selectedSow ? 1 : 0 }}
      >
        {selectedSow && (
          <div
            data-print-area
            className="fixed inset-0 z-40 overflow-y-auto bg-background md:sticky md:top-14 md:inset-auto md:z-auto md:flex md:h-[calc(100vh-3.5rem)] md:w-[var(--panel-w)] md:flex-col md:border-l md:border-border md:bg-muted/40 flex flex-col"
            style={{ ['--panel-w' as any]: `${sidebarWidth}px` }}
          >
            <PrintHeader />
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
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Status</h3>
                  <Badge tone={STATUS_TONE[selectedSow.status]}>{STATUS_LABEL[selectedSow.status]}</Badge>
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

              <div className="border-t border-border pt-6 no-print">
                <h3 className="text-sm font-semibold text-foreground mb-4">Comments</h3>
                {(() => {
                  const sowComments = comments[selectedSow.id] ?? [];
                  if (sowComments.length === 0) {
                    return (
                      <div className="rounded-lg border border-dashed border-border p-6 text-center">
                        <p className="text-sm font-medium text-foreground">No Comments Yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Feedback on this SOW will show up here.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {sowComments.map((comment) => (
                        <div key={comment.id} className="rounded-lg border border-border bg-card p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold dark:bg-blue-900 dark:text-blue-300">
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
                  placeholder={taggedSectionKey ? `Comment on ${clauseByKey(taggedSectionKey)?.heading ?? 'this section'}...` : 'Leave a comment...'}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  className="mt-3 w-full rounded-md border border-border bg-card p-3 text-sm focus:border-primary focus:bg-background focus:outline-none min-h-25 resize-none"
                />
                <Button className="w-full mt-3" disabled={!commentDraft.trim()} onClick={handlePostReply}>
                  Post comment
                </Button>
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0 no-print">
              <Button variant="ghost" onClick={closeSidebar}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
