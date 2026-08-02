'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Check, FileText } from 'lucide-react';
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
import { currentUsers } from '@/lib/data/current-user';
import { projects } from '@/lib/data/projects';
import { createSow } from '@/lib/data/sows';
import { templates, hasPlaceholders } from '@/lib/data/templates';
import { generateDocxBlob } from '@/lib/docx/generate-docx';
import { parseDocxFile } from '@/lib/docx/parse-docx';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[36rem] rounded-md border" />,
  },
);

type Step = 'project' | 'template' | 'fill' | 'edit';

function placeholderLabel(token: string) {
  return token
    .replace(/^\{\{|\}\}$/g, '')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

function fillPlaceholders(bodyHtml: string, values: Record<string, string>) {
  let html = bodyHtml;
  for (const [token, value] of Object.entries(values)) {
    if (!value) continue;
    html = html.split(token).join(value);
  }
  return html;
}

export default function NewSowPage() {
  const router = useRouter();
  const me = currentUsers.tenant_admin;

  const [step, setStep] = useState<Step>('project');
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [saving, setSaving] = useState(false);

  const editorRef = useRef<DocxEditorRef>(null);

  const project = projects.find((p) => p.id === projectId);
  const template = templates.find((t) => t.id === templateId);
  const availableTemplates = templates.filter((t) => t.status === 'active');

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

  async function handleSaveDraft() {
    if (!project || !template) return;
    setSaving(true);
    try {
      const buf = await editorRef.current?.save();
      let documentHtml = filledHtml;
      if (buf) {
        const file = new File([buf], `${title}.docx`, {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        documentHtml = (await parseDocxFile(file)).html;
      }
      const sow = createSow({
        title: title.trim(),
        clientId: project.clientId,
        clientName: project.clientName,
        projectId: project.id,
        projectName: project.name,
        creator: me.name,
        templateName: template.name,
        documentHtml,
      });
      toast.success('SOW saved as draft (prototype only — not persisted)');
      router.push(`/tenant-admin/sows/${sow.id}`);
    } catch {
      toast.error('Could not save this draft — try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/tenant-admin/sows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to SOWs
      </Link>
      <PageHeader
        title="New SOW"
        description="Generate a SOW from a template, then refine it before saving as a draft."
      />

      <div className="mb-8 flex items-center gap-1.5 sm:gap-2">
        {(['project', 'template', 'fill', 'edit'] as Step[]).map((s, i) => {
          const stepIndex = (
            ['project', 'template', 'fill', 'edit'] as Step[]
          ).indexOf(step);
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
                        : 'Edit Document'}
                </span>
              </div>
              {i < 3 && <span className="h-px flex-1 bg-border" />}
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
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              Make any final adjustments, then save your SOW as a draft.
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

            <div className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setStep('fill')}>
                Back
              </Button>
              <Button onClick={handleSaveDraft} disabled={saving}>
                {saving ? 'Saving…' : 'Save as Draft'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
