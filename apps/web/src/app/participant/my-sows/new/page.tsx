'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Check,
  FileText,
  Workflow as WorkflowIcon,
} from 'lucide-react';
import type { DocxEditorRef } from '@eigenpal/docx-editor-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { WorkflowFlowDiagram } from '@/components/tenant-admin/workflow-flow-diagram';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectsForUser } from '@/lib/data/projects';
import { createDraftSow, publishSow } from '@/lib/actions/sows';
import { templates, hasPlaceholders } from '@/lib/data/templates';
import { workflowTemplates } from '@/lib/data/workflow-templates';
import { generateDocxBlob } from '@/lib/docx/generate-docx';
import { parseDocxFile } from '@/lib/docx/parse-docx';
import { fillPlaceholders, placeholderLabel } from '@/lib/docx/placeholders';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[36rem] rounded-md border" />,
  },
);

type Step = 'project' | 'template' | 'fill' | 'edit' | 'workflow';

const STEPS: Step[] = ['project', 'template', 'fill', 'edit', 'workflow'];

export default function NewSowPage() {
  const router = useRouter();
  const me = currentUsers.participant;
  const creatorProjects = getProjectsForUser(me.id, 'creator');

  const [step, setStep] = useState<Step>('project');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [saving, setSaving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [documentHtml, setDocumentHtml] = useState<string | undefined>(
    undefined,
  );
  const [workflowTemplateId, setWorkflowTemplateId] = useState('');
  const [publishing, setPublishing] = useState(false);

  const editorRef = useRef<DocxEditorRef>(null);

  const project = creatorProjects.find((p) => p.id === projectId);
  const template = templates.find((t) => t.id === templateId);
  const availableTemplates = templates.filter((t) => t.status === 'active');
  const activeWorkflowTemplates = workflowTemplates.filter(
    (w) => w.status === 'active',
  );
  const selectedWorkflow = activeWorkflowTemplates.find(
    (w) => w.id === workflowTemplateId,
  );

  const filledHtml = useMemo(
    () => (template ? fillPlaceholders(template.bodyHtml, values) : ''),
    [template, values],
  );

  useEffect(() => {
    if (step !== 'edit' || !template) return;
    let cancelled = false;
    generateDocxBlob(filledHtml)
      .then((blob) => blob.arrayBuffer())
      .then((buf) => {
        if (!cancelled) setBuffer(buf);
      });
    return () => {
      cancelled = true;
    };
  }, [step]);

  function goToTemplate() {
    if (!project) return;
    setStep('template');
  }

  function goToFill() {
    if (!title.trim() || !template) return;
    setStep('fill');
  }

  function goToEdit() {
    setBuffer(null);
    setStep('edit');
  }

  async function captureDocumentHtml(): Promise<string> {
    const buf = await editorRef.current?.save();
    if (!buf) return filledHtml;
    const file = new File([buf], `${title}.docx`, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    return (await parseDocxFile(file)).html;
  }

  async function handleSaveDraft() {
    if (!project || !template) return;
    setSaving(true);
    try {
      const html = await captureDocumentHtml();
      await createDraftSow({
        title: title.trim(),
        clientId: project.clientId,
        clientName: project.clientName,
        projectId: project.id,
        projectName: project.name,
        creator: me.name,
        templateName: template.name,
        templateId: template.id,
        placeholderValues: values,
        documentHtml: html,
      });
      toast.success('SOW saved as draft');
      router.push('/participant/my-sows');
    } catch {
      toast.error('Could not save this draft — try again.');
    } finally {
      setSaving(false);
    }
  }

  async function goToWorkflow() {
    setCapturing(true);
    try {
      setDocumentHtml(await captureDocumentHtml());
      setStep('workflow');
    } finally {
      setCapturing(false);
    }
  }

  async function handlePublish() {
    if (!project || !template || !selectedWorkflow) return;
    setPublishing(true);
    try {
      await publishSow(
        {
          title: title.trim(),
          clientId: project.clientId,
          clientName: project.clientName,
          projectId: project.id,
          projectName: project.name,
          creator: me.name,
          templateName: template.name,
          templateId: template.id,
          placeholderValues: values,
          documentHtml: documentHtml ?? filledHtml,
        },
        selectedWorkflow.id,
        selectedWorkflow.name,
      );
      toast.success('SOW published — approval process started');
      router.push('/participant/my-sows');
    } catch {
      toast.error('Could not publish this SOW — try again.');
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div>
      <Link
        href="/participant/my-sows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to My SOWs
      </Link>
      <PageHeader
        title="New SOW"
        description="Generate a SOW from a template, refine it, then choose a workflow to publish for approval — or save as a draft to finish later."
      />

      <div className="mb-8 flex items-center gap-1.5 sm:gap-2">
        {STEPS.map((s, i) => {
          const stepIndex = STEPS.indexOf(step);
          const done = i < stepIndex;
          return (
            <div
              key={s}
              className="flex flex-1 items-center gap-1.5 sm:gap-2 last:flex-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    step === s
                      ? 'bg-primary text-primary-foreground'
                      : done
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span
                  className={`hidden text-sm sm:inline ${step === s ? 'font-medium' : 'text-muted-foreground'}`}
                >
                  {s === 'project'
                    ? 'Project'
                    : s === 'template'
                      ? 'Template & Details'
                      : s === 'fill'
                        ? 'Fill Placeholders'
                        : s === 'edit'
                          ? 'Edit Document'
                          : 'Workflow'}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-border" />
              )}
            </div>
          );
        })}
      </div>

      {step === 'project' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose a project</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="max-w-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sow-project">Project</Label>
                <Select
                  value={projectId}
                  onValueChange={(value) => setProjectId(value ?? '')}
                >
                  <SelectTrigger id="sow-project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {creatorProjects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only projects where you have the Creator role are shown.
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={goToTemplate} disabled={!project}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template &amp; details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="max-w-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sow-title">SOW title</Label>
                <Input
                  id="sow-title"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                  placeholder="Phase 3 Implementation SOW"
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Choose a template</Label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availableTemplates.map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-colors ${
                      templateId === t.id
                        ? 'border-primary ring-1 ring-primary'
                        : 'hover:border-muted-foreground/50'
                    }`}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="size-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{t.name}</span>
                        </span>
                        {templateId === t.id && (
                          <Check className="size-4 shrink-0 text-primary" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant={hasPlaceholders(t) ? 'default' : 'outline'}
                      >
                        {hasPlaceholders(t) ? 'Structured' : 'DOCX'}
                      </Badge>
                      <span>v{t.version}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('project')}>
                Back
              </Button>
              <Button onClick={goToFill} disabled={!title.trim() || !template}>
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'fill' && template && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fill in placeholders</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex max-w-sm flex-col gap-4">
              {template.placeholders.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  This template has no placeholders to fill.
                </p>
              )}
              {template.placeholders.map((token) => (
                <div key={token} className="flex flex-col gap-1.5">
                  <Label htmlFor={`ph-${token}`}>
                    {placeholderLabel(token)}
                  </Label>
                  <Input
                    id={`ph-${token}`}
                    value={values[token] ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setValues((prev) => ({
                        ...prev,
                        [token]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('template')}>
                Back
              </Button>
              <Button onClick={goToEdit}>Continue to Editor</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'edit' && template && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit document</CardTitle>
            <p className="text-sm text-muted-foreground">
              Make any final adjustments, then save as a draft to finish later,
              or continue to choose an approval workflow.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {buffer ? (
              <DocxEditor
                ref={editorRef}
                documentBuffer={buffer}
                mode="editing"
                showZoomControl={false}
                documentName={title}
                className="h-[36rem] rounded-md border"
              />
            ) : (
              <Skeleton className="h-[36rem] rounded-md border" />
            )}

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => setStep('fill')}>
                Back
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving || capturing}
                >
                  {saving ? 'Saving…' : 'Save as Draft'}
                </Button>
                <Button onClick={goToWorkflow} disabled={capturing}>
                  {capturing ? 'Loading…' : 'Next'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'workflow' && template && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Choose an approval workflow
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select the workflow that will govern approval for this SOW, then
              publish to start the approval process.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <Label className="mb-3 block">Available workflows</Label>
              {activeWorkflowTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active workflow templates are available. Ask a tenant admin
                  to publish one before submitting this SOW.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeWorkflowTemplates.map((w) => (
                    <Card
                      key={w.id}
                      className={`cursor-pointer transition-colors ${
                        workflowTemplateId === w.id
                          ? 'border-primary ring-1 ring-primary'
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setWorkflowTemplateId(w.id)}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <WorkflowIcon className="size-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{w.name}</span>
                          </span>
                          {workflowTemplateId === w.id && (
                            <Check className="size-4 shrink-0 text-primary" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground">
                        {w.steps.length}{' '}
                        {w.steps.length === 1 ? 'step' : 'steps'}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {selectedWorkflow && (
              <div>
                <Label className="mb-3 block">Approval steps</Label>
                <WorkflowFlowDiagram steps={selectedWorkflow.steps} />
              </div>
            )}

            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('edit')}>
                Back
              </Button>
              <Button
                onClick={handlePublish}
                disabled={!selectedWorkflow || publishing}
              >
                {publishing ? 'Publishing…' : 'Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
