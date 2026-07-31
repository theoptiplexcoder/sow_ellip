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
import { useTemplateStore, type TemplateRow } from './sows/templateStore';
import { FormValuesDocument } from './sows/builder/FormValuesDocument';
import { useSowStore } from './sows/sowStore';
import { useProjectStore } from '../admin/projectStore';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { Label } from '../ui/label';
import { type SowRow, type SowStatus as Status } from './sows/sowData';
import { getVersionHistory } from './sows/sowVersionHistory';
import { VersionHistoryDialog } from './sows/VersionHistoryDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { useParticipantSowStore } from '../participant/participantSowStore';

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  APPROVED: 'Approved',
  CHANGES_REQUESTED: 'Changes requested',
  IN_REVIEW: 'In Review',
};

const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  APPROVED: 'success',
  CHANGES_REQUESTED: 'warning',
  IN_REVIEW: 'info',
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

const STATUS_FILTERS: { label: string; value: 'PUBLISHED' | 'DRAFT' }[] = [
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
  isParticipant?: boolean;
}

export function SowsPage({ hideCreateButton = false, isParticipant = false }: SowsPageProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusQuery = searchParams.get('status');
  const statusFilter = (statusQuery as 'PUBLISHED' | 'DRAFT') || 'PUBLISHED';

  const setStatusFilter = (val: 'PUBLISHED' | 'DRAFT') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('status', val);
    router.push(`${pathname}?${params.toString()}`);
  };



  const [search, setSearch] = useState('');
  const sows = useSowStore((s) => s.sows);
  const setSowStatus = useSowStore((s) => s.setStatus);
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, ReviewerComment[]>>(COMMENTS_BY_SOW);
  const [commentDraft, setCommentDraft] = useState('');
  const [selectedHistoryTemplateId, setSelectedHistoryTemplateId] = useState<string | null>(null);
  const [useTemplateTarget, setUseTemplateTarget] = useState<TemplateRow | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);
  const templates = useTemplateStore((s) => s.templates);
  const projects = useProjectStore((s) => s.projects);
  const addSow = useSowStore((s) => s.addSow);
  const addParticipantSow = useParticipantSowStore((s) => s.addSow);

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

  function handleUseTemplate() {
    if (!useTemplateTarget || !selectedProjectId) return;
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;
    const createSow = isParticipant ? addParticipantSow : addSow;
    const newSow = createSow({
      title: useTemplateTarget.name,
      project: project.name,
      description: useTemplateTarget.description || '',
      templateId: useTemplateTarget.id,
    });
    setUseTemplateTarget(null);
    router.push(`/tenantSlug/participant/sows/edit?id=${newSow.id}`);
  }

  const visibleTemplates = templates.filter(
    (t) => isParticipant ? t.isActive : (statusFilter === 'PUBLISHED' ? t.isActive : !t.isActive)
  );

  return (
    <div className="flex flex-col gap-4 w-full">
      <PageHeader
        title="Templates"
        description="Reusable templates."
        actions={
          !hideCreateButton && (
            <Button onClick={() => router.push('/tenantSlug/admin/sows/new')}>
              <Plus className="h-4 w-4" />
              New SOW Template
            </Button>
          )
        }
      />

      <div className="w-full">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {!isParticipant && (
            <div className="flex flex-wrap items-center gap-1 gap-y-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setStatusFilter(f.value as 'PUBLISHED' | 'DRAFT')}
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
          )}
          <span className="text-sm text-muted-foreground">
            {visibleTemplates.length} Template{visibleTemplates.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="min-w-0 flex-1">
            {visibleTemplates.length === 0 ? (
              <EmptyState message={`No ${statusFilter.toLowerCase()} templates found`} />
            ) : (
              <Table>
                <TableHead>
                  <Th>Template Name</Th>
                  <Th>Version</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                  <Th><span className="sr-only">Actions</span></Th>
                </TableHead>
                <TableBody>
                  {visibleTemplates.map((t) => (
                    <tr
                      key={t.id}
                      className="group cursor-pointer transition-colors hover:bg-muted/40"
                    >
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{t.name}</div>
                            {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                          </div>
                        </div>
                      </Td>
                      <Td className="text-muted-foreground">v{t.version}</Td>
                      <Td>
                        <Badge tone={t.isActive ? 'success' : 'neutral'}>{t.isActive ? 'Active' : 'Draft'}</Badge>
                      </Td>
                      <Td className="text-muted-foreground">{t.createdAt}</Td>
                      <Td className="text-right">
                        {isParticipant ? (
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setUseTemplateTarget(t);
                              setSelectedProjectId(projects[0]?.id ?? '');
                            }}
                          >
                            Use
                          </Button>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" className="h-8 w-8 p-0" id={`template-actions-${t.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  editDocument(t.id);
                                }}
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHistoryTemplateId(t.id);
                                }}
                              >
                                View Version History
                              </DropdownMenuItem>
                              {!t.isActive ? (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    useTemplateStore.getState().toggleActive(t.id);
                                  }}
                                >
                                  Publish
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    useTemplateStore.getState().toggleActive(t.id);
                                  }}
                                >
                                  Save as Draft
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-600 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  useTemplateStore.getState().deleteTemplate(t.id);
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </Td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
      </div>

      {selectedHistoryTemplateId && (
        <VersionHistoryDialog
          open={!!selectedHistoryTemplateId}
          onOpenChange={(open) => {
            if (!open) setSelectedHistoryTemplateId(null);
          }}
          sowNumber={templates.find((t) => t.id === selectedHistoryTemplateId)?.name ?? 'Template'}
          entries={getVersionHistory(selectedHistoryTemplateId)}
        />
      )}

      <Dialog open={!!useTemplateTarget} onOpenChange={(val) => !val && setUseTemplateTarget(null)}>
        <DialogContent title="Use Template" className="max-w-md">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a project to create a new Draft SOW using the <strong>{useTemplateTarget?.name}</strong> template.
            </p>
            {projects.length === 0 ? (
              <EmptyState message="No projects available" />
            ) : (
              <div>
                <Label>Select Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger />
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setUseTemplateTarget(null)}>
                Cancel
              </Button>
              <Button type="button" disabled={!selectedProjectId} onClick={handleUseTemplate}>
                Create SOW
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
