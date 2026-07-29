'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, ArrowUp, ArrowDown, X, Search, MoreHorizontal, Pencil, Zap, Trash2, FileText } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { WorkflowDiagram } from './workflows/WorkflowDiagram';
import { StepApproversEditor } from './workflows/StepApproversEditor';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';
import { APPROVERS, STEP_ROLES, approverName, approverDesignation, emptyStep, matchTypeForApproverCount, type MatchType, type Step, type StepRole } from '@sow/workflows';

type SowLink = {
  id: string;
  sowNumber: string;
  title: string;
  /** Mock progress: index of the step currently in review (steps.length = fully approved). Independent per SOW. */
  currentStep: number;
};

type Status = 'PUBLISHED' | 'DRAFT';

type WorkflowRow = {
  id: string;
  name: string;
  description?: string;
  status: Status;
  steps: Step[];
  /** A workflow can be reused across multiple SOWs, each progressing through it independently. */
  sows: SowLink[];
};

const INITIAL_WORKFLOWS: WorkflowRow[] = [
  {
    id: 'w-1',
    name: 'Standard 2-step',
    description: 'Manager review, then finance sign-off.',
    status: 'PUBLISHED',
    steps: [
      { label: 'Manager review', approverIds: ['u-3'], matchType: 'AND', role: 'APPROVER' },
      { label: 'Finance sign-off', approverIds: ['u-4'], matchType: 'AND', role: 'VIEWER' },
    ],
    sows: [
      { id: 's-1', sowNumber: 'SOW-1042', title: 'Website revamp — Phase 1', currentStep: 2 },
      { id: 's-4', sowNumber: 'SOW-1048', title: 'Phase 2 scope addendum', currentStep: 0 },
    ],
  },
  {
    id: 'w-2',
    name: 'Single approver',
    status: 'DRAFT',
    steps: [{ label: 'Director approval', approverIds: ['u-3'], matchType: 'AND', role: 'APPROVER' }],
    sows: [{ id: 's-3', sowNumber: 'SOW-1055', title: 'Support retainer renewal', currentStep: 0 }],
  },
  {
    id: 'w-3',
    name: 'Joint sign-off (AND)',
    description: 'Both Dana and Jordan must approve before it moves forward.',
    status: 'PUBLISHED',
    steps: [{ label: 'Joint review', approverIds: ['u-3', 'u-4'], matchType: 'AND', role: 'APPROVER' }],
    sows: [{ id: 's-5', sowNumber: 'SOW-1060', title: 'Joint sign-off demo', currentStep: 1 }],
  },
  {
    id: 'w-4',
    name: 'Either approver (OR)',
    description: 'Either Dana or Jordan can approve — whichever is available first.',
    status: 'PUBLISHED',
    steps: [{ label: 'Backup review', approverIds: ['u-3', 'u-4'], matchType: 'OR', role: 'APPROVER', approvedBy: ['u-4'] }],
    sows: [{ id: 's-6', sowNumber: 'SOW-1061', title: 'Either approver demo', currentStep: 1 }],
  },
  {
    id: 'w-5',
    name: 'Mixed conditions (AND + OR)',
    description: 'Joint review requires both, final sign-off accepts either.',
    status: 'PUBLISHED',
    steps: [
      { label: 'Joint review', approverIds: ['u-3', 'u-4'], matchType: 'AND', role: 'APPROVER' },
      { label: 'Final sign-off', approverIds: ['u-3', 'u-4'], matchType: 'OR', role: 'APPROVER', approvedBy: ['u-3'] },
    ],
    sows: [{ id: 's-7', sowNumber: 'SOW-1062', title: 'Mixed conditions demo', currentStep: 2 }],
  },
];

const emptyForm = {
  name: '',
  description: '',
  steps: [emptyStep()] as Step[],
};

interface WorkflowsPageProps {
  readOnly?: boolean;
}

export function WorkflowsPage({ readOnly = false }: WorkflowsPageProps = {}) {
  const [workflows, setWorkflows] = useState<WorkflowRow[]>(INITIAL_WORKFLOWS);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowRow | null>(null);
  const [deleting, setDeleting] = useState<WorkflowRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRow | null>(null);
  const [selectedSowId, setSelectedSowId] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!readOnly && searchParams.get('create') === '1') {
      openCreate();
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function selectWorkflow(workflow: WorkflowRow | null) {
    setSelectedWorkflow(workflow);
    setSelectedSowId(null);
  }

  const statusQuery = searchParams.get('status');
  const statusFilter = (statusQuery as 'ALL' | Status) || 'ALL';

  const visible = workflows.filter(
    (w) =>
      (statusFilter === 'ALL' || w.status === statusFilter) &&
      (w.name.toLowerCase().includes(search.toLowerCase()) ||
        (w.description && w.description.toLowerCase().includes(search.toLowerCase()))),
  );

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', steps: [emptyStep()] });
    setNameError(null);
    setOpen(true);
  }

  function openEdit(workflow: WorkflowRow) {
    setEditing(workflow);
    setForm({
      name: workflow.name,
      description: workflow.description ?? '',
      steps: workflow.steps.map((s) => ({ ...s, matchType: matchTypeForApproverCount(s.approverIds.length, s.matchType) })),
    });
    setNameError(null);
    setOpen(true);
  }

  function addStep() {
    setForm((f) => ({ ...f, steps: [...f.steps, emptyStep()] }));
  }

  function removeStep(index: number) {
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));
  }

  function moveStep(index: number, direction: -1 | 1) {
    setForm((f) => {
      const steps = [...f.steps];
      const target = index + direction;
      if (target < 0 || target >= steps.length) return f;
      [steps[index], steps[target]] = [steps[target], steps[index]];
      return { ...f, steps };
    });
  }

  function updateStep(index: number, patch: Partial<Step>) {
    setForm((f) => ({ ...f, steps: f.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = form.name.trim();
    if (!trimmed || form.steps.length === 0 || form.steps.some((s) => !s.label.trim() || s.approverIds.length === 0))
      return;
    const duplicate = workflows.some(
      (w) => w.name.toLowerCase() === trimmed.toLowerCase() && w.id !== editing?.id,
    );
    if (duplicate) {
      setNameError('A workflow with this name already exists in your organization.');
      return;
    }
    if (editing) {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === editing.id ? { ...w, name: trimmed, description: form.description, steps: form.steps } : w)),
      );
    } else {
      setWorkflows((prev) => [
        ...prev,
        { id: `w-${prev.length + 1}`, name: trimmed, description: form.description, status: 'DRAFT', steps: form.steps, currentStep: 0, sows: [] },
      ]);
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setDeleting(null);
  }

  function handlePublishWorkflow(id: string) {
    setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, status: 'PUBLISHED' } : w)));
  }

  const publishedCount = workflows.filter((w) => w.status === 'PUBLISHED').length;

  return (
    <div className="flex items-start gap-6">
    <div className="min-w-0 flex-1">
      <PageHeader
        title="Workflows"
        description="Ordered approval steps, each assigned to an approver in your organization."
        actions={
          !readOnly && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  New workflow
                </Button>
              </DialogTrigger>
              <DialogContent title={editing ? 'Edit workflow' : 'New workflow'} className="max-w-2xl">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="workflow-name">Name</Label>
                    <Input
                      id="workflow-name"
                      required
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        setNameError(null);
                      }}
                    />
                    {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
                  </div>
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Input
                      id="workflow-description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="mb-0">Steps</Label>
                      <Button type="button" size="sm" variant="ghost" onClick={addStep}>
                        <Plus className="h-3.5 w-3.5" />
                        Add step
                      </Button>
                    </div>
                    <div className="mb-1 flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <span className="w-5 shrink-0" />
                      <span className="flex-1">Label</span>
                      <span className="w-48 shrink-0">Approvers</span>
                      <span className="w-20 shrink-0">Logic</span>
                      <span className="w-28 shrink-0">Role</span>
                      <span className="w-21 shrink-0" />
                    </div>
                    <div className="space-y-2">
                      {form.steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 rounded-md border border-border p-2">
                          <span className="w-5 shrink-0 text-center text-xs font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                          <Input
                            placeholder="Step label"
                            required
                            className="flex-1 min-w-0"
                            value={step.label}
                            onChange={(e) => updateStep(index, { label: e.target.value })}
                          />
                          <StepApproversEditor
                            approverIds={step.approverIds}
                            approvers={APPROVERS}
                            matchType={step.matchType}
                            onChange={(patch) => updateStep(index, patch)}
                          />
                          <Select
                            value={step.matchType}
                            onValueChange={(v) => updateStep(index, { matchType: v as MatchType })}
                            disabled={step.approverIds.length <= 1}
                          >
                            <SelectTrigger className="w-20 shrink-0" />
                            <SelectContent>
                              {step.approverIds.length <= 1 ? (
                                <SelectItem value="NA">NA</SelectItem>
                              ) : (
                                <>
                                  <SelectItem value="AND">AND</SelectItem>
                                  <SelectItem value="OR">OR</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                          <Select value={step.role} onValueChange={(v) => updateStep(index, { role: v as StepRole })}>
                            <SelectTrigger className="w-28 shrink-0" />
                            <SelectContent>
                              {STEP_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {r.charAt(0) + r.slice(1).toLowerCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveStep(index, -1)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                              aria-label="Move step up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === form.steps.length - 1}
                              onClick={() => moveStep(index, 1)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                              aria-label="Move step down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={form.steps.length === 1}
                              onClick={() => removeStep(index)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent disabled:opacity-30"
                              aria-label="Remove step"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editing ? 'Save changes' : 'Create workflow'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )
        }
      />

      <Dialog open={!!deleting} onOpenChange={(val) => !val && setDeleting(null)}>
        <DialogContent title="Delete workflow" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{deleting?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleting && handleDelete(deleting.id)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {publishedCount} published · {workflows.length - publishedCount} draft
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState message={search ? 'No workflows match your search' : 'No workflows yet'} />
      ) : (
        <Table>
          <TableHead>
            <Th>Workflow</Th>
            <Th>Steps</Th>
            <Th>SOWs</Th>
            <Th>Status</Th>
            {!readOnly && <Th className="w-10">&nbsp;</Th>}
          </TableHead>
          <TableBody>
            {visible.map((workflow) => (
              <tr
                key={workflow.id}
                className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                  selectedWorkflow?.id === workflow.id ? 'bg-muted/40' : ''
                }`}
                onClick={() => selectWorkflow(workflow)}
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{workflow.name}</div>
                      {workflow.description && (
                        <div className="text-xs text-muted-foreground">{workflow.description}</div>
                      )}
                    </div>
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center gap-1.5">
                    {workflow.steps.map((step, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {step.label}
                          {i < workflow.steps.length - 1 && (
                            <span className="ml-1.5 text-border">→</span>
                          )}
                        </span>
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  {workflow.sows.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />
                      {workflow.sows.length} SOW{workflow.sows.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </Td>
                <Td>
                  <Badge tone={workflow.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {workflow.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </Td>
                {!readOnly && (
                  <Td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          id={`workflow-actions-${workflow.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {workflow.status === 'DRAFT' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePublishWorkflow(workflow.id); }}>
                            <Pencil className="mr-2 h-3.5 w-3.5 opacity-0" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openEdit(workflow)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => setDeleting(workflow)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Td>
                )}
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>

    <div
      className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out -mt-6 -mb-6 -mr-6"
      style={{ width: selectedWorkflow ? sidebarWidth : 0, opacity: selectedWorkflow ? 1 : 0 }}
    >
      {selectedWorkflow && (
        <div
          className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col border-l border-border bg-muted/40"
          style={{ width: sidebarWidth }}
        >
          <ResizeHandle onPointerDown={startResize} />
          <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedWorkflow.name}</h2>
              {selectedWorkflow.description && (
                <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => selectWorkflow(null)}
              className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Status</h3>
                <Badge tone={selectedWorkflow.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                  {selectedWorkflow.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Steps</h3>
                <p className="text-sm font-medium text-foreground">{selectedWorkflow.steps.length}</p>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">SOWs</h3>
                <p className="text-sm font-medium text-foreground">{selectedWorkflow.sows.length}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Linked SOWs</h3>
              {selectedWorkflow.sows.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <p className="text-sm font-medium text-foreground">No SOWs yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    SOWs using this workflow will show up here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedWorkflow.sows.map((sow) => (
                    <button
                      type="button"
                      key={sow.id}
                      onClick={() => setSelectedSowId(selectedSowId === sow.id ? null : sow.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg border p-3 text-left transition-colors ${
                        selectedSowId === sow.id
                          ? 'border-primary bg-accent'
                          : 'border-border bg-card hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">{sow.sowNumber}</div>
                        <div className="text-xs text-muted-foreground">{sow.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSowId && (
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Approval Flow
                  {(() => {
                    const sow = selectedWorkflow.sows.find((s) => s.id === selectedSowId);
                    return sow ? ` — ${sow.sowNumber}` : '';
                  })()}
                </h3>
                {(() => {
                  const sow = selectedWorkflow.sows.find((s) => s.id === selectedSowId);
                  if (!sow) return null;
                  return (
                    <WorkflowDiagram
                      steps={selectedWorkflow.steps}
                      approverName={approverName}
                      approverDesignation={approverDesignation}
                      currentStep={sow.currentStep}
                    />
                  );
                })()}
              </div>
            )}
          </div>

          <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => selectWorkflow(null)}>
              Close
            </Button>
            {!readOnly && <Button onClick={() => openEdit(selectedWorkflow)}>Edit Workflow</Button>}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
