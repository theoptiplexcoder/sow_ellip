'use client';

import { useState } from 'react';
import { Plus, X, Search, MoreHorizontal, Pencil, Trash2, Play, Check, FileText, ArrowUp, ArrowDown } from 'lucide-react';
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
import { useWorkflowStore, type WorkflowRow } from './workflows/workflowStore';
import { useSowStore } from './sows/sowStore';

const emptyForm = {
  name: '',
  description: '',
  steps: [emptyStep()] as Step[],
};

interface WorkflowYardPageProps {
  readOnly?: boolean;
}

export function WorkflowYardPage({ readOnly = false }: WorkflowYardPageProps = {}) {
  const workflows = useWorkflowStore((s) => s.workflows);
  const addWorkflow = useWorkflowStore((s) => s.addWorkflow);
  const updateWorkflow = useWorkflowStore((s) => s.updateWorkflow);
  const deleteWorkflowFromStore = useWorkflowStore((s) => s.deleteWorkflow);
  const attachSow = useWorkflowStore((s) => s.attachSow);
  const sows = useSowStore((s) => s.sows);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowRow | null>(null);
  const [deleting, setDeleting] = useState<WorkflowRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRow | null>(null);
  const [useTarget, setUseTarget] = useState<WorkflowRow | null>(null);
  const [selectedSowId, setSelectedSowId] = useState<string>('');
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);

  const visible = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.description && w.description.toLowerCase().includes(search.toLowerCase())),
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
      updateWorkflow(editing.id, { name: trimmed, description: form.description, steps: form.steps });
    } else {
      addWorkflow({ name: trimmed, description: form.description, steps: form.steps });
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    deleteWorkflowFromStore(id);
    setDeleting(null);
    setSelectedWorkflow((prev) => (prev?.id === id ? null : prev));
  }

  function openUse(workflow: WorkflowRow) {
    const firstAvailable = sows.find((sow) => !workflow.sows.some((s) => s.id === sow.id));
    setUseTarget(workflow);
    setSelectedSowId(firstAvailable?.id ?? '');
  }

  function handlePublish() {
    if (!useTarget || !selectedSowId) return;
    const sow = sows.find((s) => s.id === selectedSowId);
    if (!sow) return;
    attachSow(useTarget.id, {
      id: sow.id,
      sowNumber: sow.sowNumber,
      title: sow.title,
      currentStep: 0,
    });
    setPublishedMessage(`"${useTarget.name}" attached to ${sow.sowNumber} — ${sow.title}.`);
    setUseTarget(null);
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="Workflow Yard"
          description="Attach a published workflow to a SOW to kick off its approval flow."
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
                      <Label htmlFor="template-name">Name</Label>
                      <Input
                        id="template-name"
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
                      <Label htmlFor="template-description">Description</Label>
                      <Input
                        id="template-description"
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
                      <div className="mb-1 flex flex-wrap items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        <span className="w-5 shrink-0" />
                        <span className="flex-1">Label</span>
                        <span className="w-48 shrink-0">Approvers</span>
                        <span className="w-20 shrink-0">Logic</span>
                        <span className="w-28 shrink-0">Role</span>
                        <span className="w-21 shrink-0" />
                      </div>
                      <div className="space-y-2">
                        {form.steps.map((step, index) => (
                          <div key={index} className="flex flex-wrap items-center gap-2 rounded-md border border-border p-2">
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

        <Dialog open={!!useTarget} onOpenChange={(val) => !val && setUseTarget(null)}>
          <DialogContent title={`Use "${useTarget?.name}"`} className="max-w-md">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Attach this workflow&apos;s approval steps to a SOW.
              </p>
              {sows.length === 0 ? (
                <EmptyState message="No SOWs yet — create one from a template first." />
              ) : (
                <div>
                  <Label>Select a SOW</Label>
                  <Select value={selectedSowId} onValueChange={setSelectedSowId}>
                    <SelectTrigger />
                    <SelectContent>
                      {sows.map((sow) => (
                        <SelectItem key={sow.id} value={sow.id}>
                          {sow.sowNumber} — {sow.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setUseTarget(null)}>
                  Cancel
                </Button>
                <Button type="button" disabled={!selectedSowId} onClick={handlePublish}>
                  Attach
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
        </div>

        {visible.length === 0 ? (
          <EmptyState message={search ? 'No workflows match your search' : 'No workflows yet'} />
        ) : (
          <Table>
            <TableHead>
              <Th>Workflow</Th>
              <Th>Steps</Th>
              <Th>Status</Th>
              <Th>SOWs</Th>
              <Th className="text-right">Actions</Th>
            </TableHead>
            <TableBody>
              {visible.map((workflow) => (
                <tr
                  key={workflow.id}
                  className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                    selectedWorkflow?.id === workflow.id ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
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
                    <Badge tone={workflow.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                      {workflow.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                    </Badge>
                  </Td>
                  <Td className="text-muted-foreground">{workflow.sows.length}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      {workflow.status === 'PUBLISHED' && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUse(workflow);
                          }}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Use
                        </Button>
                      )}
                      {!readOnly && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              id={`workflow-yard-actions-${workflow.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {workflow.status === 'DRAFT' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  updateWorkflow(workflow.id, { status: 'PUBLISHED' });
                                  setPublishedMessage(`Workflow "${workflow.name}" has been published`);
                                }}
                              >
                                <Play className="mr-2 h-3.5 w-3.5" />
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
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div
        className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out w-0! md:w-(--panel-w)! md:-mt-6 md:-mb-6 md:-mr-6"
        style={{ ['--panel-w' as any]: `${selectedWorkflow ? sidebarWidth : 0}px`, opacity: selectedWorkflow ? 1 : 0 }}
      >
        {selectedWorkflow && (
          <div
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background md:sticky md:top-14 md:inset-auto md:z-auto md:h-[calc(100vh-3.5rem)] md:w-(--panel-w) md:overflow-visible md:border-l md:border-border md:bg-muted/40"
            style={{ ['--panel-w' as any]: `${sidebarWidth}px` }}
          >
            <ResizeHandle onPointerDown={startResize} className="hidden md:block" />
            <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedWorkflow.name}</h2>
                {selectedWorkflow.description && (
                  <p className="text-sm text-muted-foreground">{selectedWorkflow.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedWorkflow(null)}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <h3 className="text-sm font-semibold text-foreground mb-4">Approval Flow</h3>
                <WorkflowDiagram
                  steps={selectedWorkflow.steps}
                  approverName={approverName}
                  approverDesignation={approverDesignation}
                  currentStep={-1}
                />
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setSelectedWorkflow(null)}>
                Close
              </Button>
              {selectedWorkflow.status === 'PUBLISHED' && (
                <Button onClick={() => openUse(selectedWorkflow)}>
                  <Play className="h-4 w-4" />
                  Use
                </Button>
              )}
              {!readOnly && <Button onClick={() => openEdit(selectedWorkflow)}>Edit Workflow</Button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
