'use client';

import { useState } from 'react';
import { Plus, X, Search, MoreHorizontal, Pencil, Copy, Trash2 } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
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

type WorkflowTemplateRow = {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
};

const INITIAL_TEMPLATES: WorkflowTemplateRow[] = [
  {
    id: 't-1',
    name: 'Standard SOW Approval',
    description: 'General 2-step approval for standard Statements of Work.',
    steps: [
      { label: 'Manager review', approverIds: ['u-3'], matchType: 'AND', role: 'APPROVER' },
      { label: 'Finance sign-off', approverIds: ['u-4'], matchType: 'AND', role: 'VIEWER' },
    ],
  },
  {
    id: 't-2',
    name: 'Quick Approval',
    description: 'Fast track single-step approval.',
    steps: [{ label: 'Director approval', approverIds: ['u-3'], matchType: 'AND', role: 'APPROVER' }],
  },
  {
    id: 't-3',
    name: 'Joint sign-off (AND)',
    description: 'Both Dana and Jordan must approve before it moves forward.',
    steps: [{ label: 'Joint review', approverIds: ['u-3', 'u-4'], matchType: 'AND', role: 'APPROVER' }],
  },
  {
    id: 't-4',
    name: 'Either approver (OR)',
    description: 'Either Dana or Jordan can approve — whichever is available first.',
    steps: [{ label: 'Backup review', approverIds: ['u-3', 'u-4'], matchType: 'OR', role: 'APPROVER' }],
  },
  {
    id: 't-5',
    name: 'Mixed conditions (AND + OR)',
    description: 'Joint review requires both, final sign-off accepts either.',
    steps: [
      { label: 'Joint review', approverIds: ['u-3', 'u-4'], matchType: 'AND', role: 'APPROVER' },
      { label: 'Final sign-off', approverIds: ['u-3', 'u-4'], matchType: 'OR', role: 'APPROVER' },
    ],
  },
];

const emptyForm = {
  name: '',
  description: '',
  steps: [emptyStep()] as Step[],
};

export function WorkflowYardPage() {
  const [templates, setTemplates] = useState<WorkflowTemplateRow[]>(INITIAL_TEMPLATES);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowTemplateRow | null>(null);
  const [deleting, setDeleting] = useState<WorkflowTemplateRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplateRow | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(720, 360, 720);

  const visible = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())),
  );

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
      setNameError('A template with this name already exists.');
      return;
    }
    if (editing) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, name: trimmed, description: form.description, steps: form.steps } : t)),
      );
    } else {
      setTemplates((prev) => [
        ...prev,
        { id: `t-${prev.length + 1}`, name: trimmed, description: form.description, steps: form.steps },
      ]);
    }
    setOpen(false);
  }

  function handleDelete(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeleting(null);
  }

  return (
    <div className="flex items-start gap-6">
      <div className="min-w-0 flex-1">
        <PageHeader
          title="Workflow Yard"
          description="Reusable workflow templates for your organization."
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Create Workflow
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

        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {visible.length} template{visible.length !== 1 ? 's' : ''}
          </span>
        </div>

        {visible.length === 0 ? (
          <EmptyState message={search ? 'No templates match your search' : 'No templates yet'} />
        ) : (
          <Table>
            <TableHead>
              <Th>Template</Th>
              <Th>Steps</Th>
              <Th className="w-10">&nbsp;</Th>
            </TableHead>
            <TableBody>
              {visible.map((template) => (
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
                    <div className="flex items-center gap-1.5">
                      {template.steps.map((step, i) => (
                        <span key={i} className="inline-flex items-center gap-1">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                            {i + 1}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {step.label}
                            {i < template.steps.length - 1 && (
                              <span className="ml-1.5 text-border">→</span>
                            )}
                          </span>
                        </span>
                      ))}
                    </div>
                  </Td>
                  <Td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          id={`workflow-yard-actions-${template.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEdit(template)}>
                          <Pencil className="mr-2 h-3.5 w-3.5" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => setDeleting(template)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
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

      <div
        className="shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out -mt-6 -mb-6 -mr-6"
        style={{ width: selectedTemplate ? sidebarWidth : 0, opacity: selectedTemplate ? 1 : 0 }}
      >
        {selectedTemplate && (
          <div
            className="sticky top-14 flex h-[calc(100vh-3.5rem)] flex-col border-l border-border bg-muted/40"
            style={{ width: sidebarWidth }}
          >
            <ResizeHandle onPointerDown={startResize} />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium uppercase text-muted-foreground mb-1">Steps</h3>
                  <p className="text-sm font-medium text-foreground">{selectedTemplate.steps.length}</p>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Approval Flow</h3>
                <WorkflowDiagram
                  steps={selectedTemplate.steps}
                  approverName={approverName}
                  approverDesignation={approverDesignation}
                  currentStep={-1} // -1 means it's a template, no current active step
                />
              </div>
            </div>

            <div className="border-t border-border p-4 flex items-center justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button onClick={() => openEdit(selectedTemplate)}>Edit Template</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
