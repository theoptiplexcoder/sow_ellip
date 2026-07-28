'use client';

import { useState } from 'react';
import { Search, FolderKanban, FileText, X } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Input, Textarea } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';

type Status = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

type ProjectRow = {
  id: string;
  name: string;
  status: Status;
  startDate?: string;
  endDate?: string;
};

const STATUS_TONE: Record<Status, 'success' | 'warning' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

const STATUS_LABEL: Record<Status, string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_FILTERS: { label: string; value: 'ALL' | Status }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'On hold', value: 'ON_HOLD' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PROJECTS: ProjectRow[] = [
  { id: 'p-1', name: 'Website revamp', status: 'ACTIVE', startDate: '2026-02-01', endDate: '2026-06-30' },
  { id: 'p-2', name: 'Data migration', status: 'ON_HOLD', startDate: '2026-03-10' },
  { id: 'p-4', name: 'Mobile app redesign', status: 'COMPLETED', startDate: '2025-09-01', endDate: '2026-01-15' },
];

type SowStatus = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED' | 'APPROVED';

type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  status: SowStatus;
  version: number;
  updatedAt: string;
};

const SOW_STATUS_LABEL: Record<SowStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  CHANGES_REQUESTED: 'Changes requested',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
};

const SOW_STATUS_TONE: Record<SowStatus, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  IN_REVIEW: 'info',
  CHANGES_REQUESTED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'success',
};

const SOWS_BY_PROJECT: Record<string, SowRow[]> = {
  'p-1': [
    { id: 's-1', sowNumber: 'SOW-1042', title: 'Website revamp — Phase 1', status: 'APPROVED', version: 2, updatedAt: '2026-07-20' },
    { id: 's-4', sowNumber: 'SOW-1048', title: 'Phase 2 scope addendum', status: 'CHANGES_REQUESTED', version: 1, updatedAt: '2026-07-18' },
  ],
  'p-2': [
    { id: 's-2', sowNumber: 'SOW-1051', title: 'Data migration plan', status: 'IN_REVIEW', version: 1, updatedAt: '2026-07-25' },
  ],
  'p-4': [],
};

type RequirementComment = { id: string; author: string; text: string; createdAt: string };

const COMMENTS_BY_PROJECT: Record<string, RequirementComment[]> = {
  'p-1': [
    {
      id: 'rc-1',
      author: 'Ravi Shah',
      text: 'We now also need the homepage to support a multi-language toggle (EN/ES).',
      createdAt: '2026-07-22',
    },
    {
      id: 'rc-2',
      author: 'Ravi Shah',
      text: 'Can we push the checkout redesign to Phase 2? Budget got trimmed this quarter.',
      createdAt: '2026-07-26',
    },
  ],
  'p-2': [
    {
      id: 'rc-3',
      author: 'Ravi Shah',
      text: 'Legacy records older than 2022 can be archived instead of migrated — reduces scope.',
      createdAt: '2026-07-24',
    },
  ],
  'p-4': [],
};

export function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(640, 280, 640);
  const [comments, setComments] = useState<Record<string, RequirementComment[]>>(COMMENTS_BY_PROJECT);
  const [newComment, setNewComment] = useState('');

  const visible = PROJECTS.filter(
    (p) => statusFilter === 'ALL' || p.status === statusFilter,
  ).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function addComment(projectId: string) {
    const text = newComment.trim();
    if (!text) return;
    const comment: RequirementComment = {
      id: `rc-${Date.now()}`,
      author: 'You',
      text,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setComments((prev) => ({ ...prev, [projectId]: [...(prev[projectId] ?? []), comment] }));
    setNewComment('');
  }

  return (
    <div className="flex items-start gap-6">
    <div className="min-w-0 flex-1">
      <PageHeader
        title="Projects"
        description="Work your organization is delivering for you."
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
          {visible.length} project{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState message={search || statusFilter !== 'ALL' ? 'No projects match your filters' : 'No projects yet'} />
      ) : (
        <Table>
          <TableHead>
            <Th>Project</Th>
            <Th>Status</Th>
            <Th>Timeline</Th>
          </TableHead>
          <TableBody>
            {visible.map((project) => (
              <tr
                key={project.id}
                className="group cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setSelectedProject(project)}
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{project.name}</span>
                  </div>
                </Td>
                <Td>
                  <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                </Td>
                <Td className="text-muted-foreground">
                  {project.startDate ?? '—'} → {project.endDate ?? '—'}
                </Td>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>

    {selectedProject && (
      <aside
        className="sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-l border-border bg-muted/40 p-4 -mt-6 -mb-6 -mr-6"
        style={{ width: sidebarWidth }}
      >
        <ResizeHandle onPointerDown={startResize} />
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-base font-semibold text-foreground">{selectedProject.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">SOWs for this project</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelectedProject(null)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {(() => {
          const sows = SOWS_BY_PROJECT[selectedProject.id] ?? [];
          return sows.length === 0 ? (
            <EmptyState message="No SOWs for this project yet" />
          ) : (
            <ul className="space-y-2">
              {sows.map((sow) => (
                <li
                  key={sow.id}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{sow.sowNumber}</div>
                    <div className="truncate text-xs text-muted-foreground">{sow.title}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone={SOW_STATUS_TONE[sow.status]}>{SOW_STATUS_LABEL[sow.status]}</Badge>
                    <div className="mt-1 text-xs text-muted-foreground">v{sow.version}</div>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}

        <div className="mt-6 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Requirements</h3>
          {(() => {
            const projectComments = comments[selectedProject.id] ?? [];
            return projectComments.length === 0 ? (
              <p className="mb-3 text-xs text-muted-foreground">No requirements logged yet.</p>
            ) : (
              <ul className="mb-3 space-y-2">
                {projectComments.map((comment) => (
                  <li key={comment.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{comment.author}</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.text}</p>
                  </li>
                ))}
              </ul>
            );
          })()}
          <Textarea
            placeholder="Log a new requirement for your consultant..."
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button size="sm" onClick={() => addComment(selectedProject.id)}>
              Add comment
            </Button>
          </div>
        </div>
      </aside>
    )}
    </div>
  );
}
