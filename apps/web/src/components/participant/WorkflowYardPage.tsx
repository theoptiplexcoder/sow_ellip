'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Plus, X, Search, MoreHorizontal, Pencil, Copy, Trash2, ShieldCheck, User as UserIcon, Play, Check } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { WorkflowDiagram } from '../admin/workflows/WorkflowDiagram';
import { StepApproversEditor } from '../admin/workflows/StepApproversEditor';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';
import { APPROVERS, STEP_ROLES, approverName, emptyStep, matchTypeForApproverCount, type MatchType, type Step, type StepRole } from '@sow/workflows';
import { useWorkflowTemplateStore, type WorkflowTemplateRow } from '../admin/workflows/workflowTemplateStore';

const CURRENT_USER_ID = 'u-2';
const CURRENT_USER_NAME = 'Sam Okafor';

const MY_SOWS = [
  { id: 's-1', sowNumber: 'SOW-1051', title: 'Q3 Platform Migration' },
  { id: 's-2', sowNumber: 'SOW-1055', title: 'Support Retainer Renewal' },
  { id: 's-3', sowNumber: 'SOW-1044', title: 'Data Warehouse Buildout' },
];

const emptyForm = {
  name: '',
  description: '',
  steps: [emptyStep()] as Step[],
};

function StepsPreview({ steps }: { steps: Step[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((step, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {i + 1}
          </span>
          <span className="text-xs text-muted-foreground">
            {step.label}
            {i < steps.length - 1 && <span className="ml-1.5 text-border">→</span>}
          </span>
        </span>
      ))}
    </div>
  );
}

export function WorkflowYardPage() {
  const templates = useWorkflowTemplateStore((s) => s.templates);
  const addTemplate = useWorkflowTemplateStore((s) => s.addTemplate);
  const updateTemplate = useWorkflowTemplateStore((s) => s.updateTemplate);
  const deleteTemplateFromStore = useWorkflowTemplateStore((s) => s.deleteTemplate);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowTemplateRow | null>(null);
  const [deleting, setDeleting] = useState<WorkflowTemplateRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateRow | null>(null);
  const [useTarget, setUseTarget] = useState<WorkflowTemplateRow | null>(null);
  const [selectedSowId, setSelectedSowId] = useState(MY_SOWS[0].id);
  const [publishedMessage, setPublishedMessage] = useState<string | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin/');

  const matchesSearch = (t: WorkflowTemplateRow) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

  const orgTemplates = templates.filter((t) => t.ownerId !== CURRENT_USER_ID && matchesSearch(t));
  const myTemplates = templates.filter((t) => t.ownerId === CURRENT_USER_ID && matchesSearch(t));

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', steps: [emptyStep()] });
    setNameError(null);
    setOpen(true);
  }

  function openEdit(template: WorkflowTemplateRow) {
    setEditing(template);
    setForm({
      name: template.name,
      description: template.description ?? '',
      steps: template.steps.map((s) => ({ ...s, matchType: matchTypeForApproverCount(s.approverIds.length, s.matchType) })),
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

  function updateStep(index: number, patch: Partial<Step>) {
    setForm((f) => ({ ...f, steps: f.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = form.name.trim();
    if (!trimmed || form.steps.length === 0 || form.steps.some((s) => !s.label.trim() || s.approverIds.length === 0))
      return;
    const duplicate = templates.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase() && t.id !== editing?.id,
    );
    if (duplicate) {
      setNameError('A workflow with this name already exists.');
      return;
    }
    if (editing) {
      updateTemplate(editing.id, { name: trimmed, description: form.description, steps: form.steps });
    } else {
      addTemplate({ name: trimmed, description: form.description, steps: form.steps, ownerId: CURRENT_USER_ID, ownerName: CURRENT_USER_NAME });
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    deleteTemplateFromStore(id);
    setDeleting(null);
    setSelectedTemplate((prev) => (prev?.id === id ? null : prev));
  }



  function openUse(template: WorkflowTemplateRow) {
    setUseTarget(template);
    setSelectedSowId(MY_SOWS[0].id);
  }

  function handlePublish() {
    if (!useTarget) return;
    const sow = MY_SOWS.find((s) => s.id === selectedSowId);
    if (!sow) return;
    setPublishedMessage(`"${useTarget.name}" published to ${sow.sowNumber} — ${sow.title}.`);
    setUseTarget(null);
  }



  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="Workflow Yard"
          description="Reusable workflow templates — from your organization, or your own."
          actions={
            isAdmin && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    New template
                  </Button>
                </DialogTrigger>
              <DialogContent title={editing ? 'Edit workflow template' : 'New workflow template'} className="max-w-2xl">
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
                    <div className="mb-1 flex items-center gap-2 px-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <span className="w-5 shrink-0" />
                      <span className="flex-1">Label</span>
                      <span className="w-48 shrink-0">Approvers</span>
                      <span className="w-20 shrink-0">Logic</span>
                      <span className="w-28 shrink-0">Role</span>
                      <span className="w-6 shrink-0" />
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
                    <Button type="submit">{editing ? 'Save changes' : 'Create Workflow'}</Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            )
          }
        />

        <Dialog open={!!deleting} onOpenChange={(val) => !val && setDeleting(null)}>
          <DialogContent title="Delete template" className="max-w-md">
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
                Attach this workflow&apos;s approval steps to a SOW, then publish it.
              </p>
              <div>
                <Label>Select a SOW</Label>
                <Select value={selectedSowId} onValueChange={setSelectedSowId}>
                  <SelectTrigger />
                  <SelectContent>
                    {MY_SOWS.map((sow) => (
                      <SelectItem key={sow.id} value={sow.id}>
                        {sow.sowNumber} — {sow.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setUseTarget(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handlePublish}>
                  Publish
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

        <div className="mb-6 flex items-center gap-3">
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

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">From your organization</h2>
            <span className="text-xs text-muted-foreground">Set up by an admin — reuse as-is, or duplicate to customize.</span>
          </div>
          {orgTemplates.length === 0 ? (
            <EmptyState message={search ? 'No organization workflows match your search' : 'No organization workflows yet'} />
          ) : (
            <Table>
              <TableHead>
                <Th>Template</Th>
                <Th>Steps</Th>

                <Th className="text-right">Actions</Th>
              </TableHead>
              <TableBody>
                {orgTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                      selectedTemplate?.id === template.id ? 'bg-muted/40' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <StepsPreview steps={template.steps} />
                    </Td>

                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUse(template);
                          }}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Use
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Your templates</h2>
            <span className="text-xs text-muted-foreground">Workflows you've created for yourself.</span>
          </div>
          {myTemplates.length === 0 ? (
            <EmptyState message={search ? 'No personal workflows match your search' : 'No personal workflows yet'} />
          ) : (
            <Table>
              <TableHead>
                <Th>Template</Th>
                <Th>Steps</Th>
                <Th className="text-right">Actions</Th>
              </TableHead>
              <TableBody>
                {myTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                      selectedTemplate?.id === template.id ? 'bg-muted/40' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                          <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{template.name}</div>
                          {template.description && (
                            <div className="text-xs text-muted-foreground">{template.description}</div>
                          )}
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <StepsPreview steps={template.steps} />
                    </Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUse(template);
                          }}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Use
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(template); }}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); setDeleting(template); }}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Td>
                  </tr>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

      </div>

      <div
        className={`w-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out md:shrink-0 md:-mt-6 md:-mb-6 md:-mr-6 ${selectedTemplate ? 'md:w-[var(--panel-w)]' : 'md:w-0'}`}
        style={{ ['--panel-w' as any]: `${sidebarWidth}px`, opacity: selectedTemplate ? 1 : 0 }}
      >
        {selectedTemplate && (
          <div
            className="fixed inset-0 z-40 overflow-y-auto bg-background p-4 md:sticky md:top-14 md:inset-auto md:z-auto md:flex md:h-[calc(100vh-3.5rem)] md:w-[var(--panel-w)] md:flex-col md:border-l md:border-border md:bg-muted/40 md:p-0"
          >
            <ResizeHandle onPointerDown={startResize} className="hidden md:block" />
            <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{selectedTemplate.name}</h2>
                {selectedTemplate.description && (
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="rounded-full p-2 hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Steps</h3>
                  <p className="text-sm font-medium text-foreground">{selectedTemplate.steps.length}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Owner</h3>
                  <p className="text-sm font-medium text-foreground">
                    {selectedTemplate.ownerId === CURRENT_USER_ID ? 'You' : selectedTemplate.ownerName}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Approval Flow</h3>
                <WorkflowDiagram
                  steps={selectedTemplate.steps}
                  approverName={approverName}
                  currentStep={-1}
                />
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
              <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => openUse(selectedTemplate)}>
                <Play className="h-4 w-4" />
                Use
              </Button>
              <Button onClick={() => openUse(selectedTemplate)}>
                <Plus className="h-4 w-4" />
                Add SOW
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
