'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DocxEditorRef } from '@eigenpal/docx-editor-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sow-platform/ui';
import { AlertTriangle, FileText, FormInput } from 'lucide-react';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { SowAiAgentPanel } from '@/components/shared/sow-ai-agent-panel';
import { SowBuilderSections } from '@/components/shared/sow-builder-sections';
import { SowCommentsPanel } from '@/components/shared/sow-comments-panel';
import { SowExportActions } from '@/components/shared/sow-export-actions';
import { SowStateStrip } from '@/components/shared/sow-state-strip';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { Surface } from '@/components/shared/surface';
import { WorkflowTimeline } from '@/components/shared/workflow-timeline';
import { type Sow, submitSowForApproval, updateSow } from '@/lib/data/sows';
import { auditLogs } from '@/lib/data/audit-logs';
import { hasAnyProviderApiKey } from '@/lib/data/ai-settings';
import { getTemplate } from '@/lib/data/templates';
import { generateDocxBlob } from '@/lib/docx/generate-docx';
import { fillPlaceholders, placeholderLabel } from '@/lib/docx/placeholders';
import { parseDocxFile } from '@/lib/docx/parse-docx';

const TINT = 'var(--status-pending)';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[36rem] rounded-md border" />,
  },
);

export function SowDetailTabs({
  sow,
  variant,
  showConflictBanner = false,
}: {
  sow: Sow;
  variant: 'tenant-admin' | 'creator';
  showConflictBanner?: boolean;
}) {
  const router = useRouter();
  const draftRef = useRef(sow.sections);
  const latestRevision = sow.revisions[sow.revisions.length - 1];
  const relatedAudit = auditLogs.filter(
    (a) => a.entityName.includes(sow.number) || a.entityType === 'SOW',
  );

  const isDraft = sow.status === 'draft';
  const template = sow.templateId ? getTemplate(sow.templateId) : undefined;
  const isTemplated = isDraft && !!template;
  const showAgentPanel = hasAnyProviderApiKey();

  const [values, setValues] = useState<Record<string, string>>(
    sow.placeholderValues ?? {},
  );
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<DocxEditorRef>(null);

  useEffect(() => {
    if (!isTemplated || !template) return;
    let cancelled = false;
    generateDocxBlob(fillPlaceholders(template.bodyHtml, values))
      .then((blob) => blob.arrayBuffer())
      .then((buf) => {
        if (!cancelled) setBuffer(buf);
      });
    return () => {
      cancelled = true;
    };
  }, [sow.id]);

  function applyValuesToDocument() {
    if (!template) return;
    setBuffer(null);
    generateDocxBlob(fillPlaceholders(template.bodyHtml, values))
      .then((blob) => blob.arrayBuffer())
      .then(setBuffer);
  }

  async function handleSaveDraft() {
    if (isTemplated && template) {
      setSaving(true);
      try {
        const buf = await editorRef.current?.save();
        let documentHtml = fillPlaceholders(template.bodyHtml, values);
        if (buf) {
          const file = new File([buf], `${sow.title}.docx`, {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          documentHtml = (await parseDocxFile(file)).html;
        }
        updateSow(sow.id, { placeholderValues: values, documentHtml });
        toast.success('Draft saved');
        router.refresh();
      } catch {
        toast.error('Could not save this draft — try again.');
      } finally {
        setSaving(false);
      }
      return;
    }
    updateSow(sow.id, { sections: draftRef.current });
    toast.success('Draft saved');
    router.refresh();
  }

  function handleSubmitForApproval() {
    submitSowForApproval(sow.id);
    toast.success('Submitted for approval');
    router.refresh();
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="builder">Builder</TabsTrigger>
        <TabsTrigger value="workflow">Workflow</TabsTrigger>
        <TabsTrigger value="versions">Versions</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
        <TabsTrigger value="comments">Comments</TabsTrigger>
        <TabsTrigger value="audit">Audit</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="mb-4">
          <SowStateStrip status={sow.status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium">{sow.clientName}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Project
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium">{sow.projectName}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium">{sow.creator}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Workflow Template
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium">
              {sow.workflowTemplateName}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="builder">
        {showConflictBanner && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>This draft was updated elsewhere</AlertTitle>
            <AlertDescription>
              Reload to see the latest version before continuing.
            </AlertDescription>
          </Alert>
        )}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SowStateStrip status={sow.status} />
          <SowExportActions sowId={sow.id} />
        </div>
        {isTemplated && template ? (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div>
              <SectionEyebrow
                icon={FormInput}
                tint={TINT}
                label="Placeholder values"
                description={`From "${template.name}"`}
              />
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={applyValuesToDocument}
                  >
                    Apply to document
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div
              className={
                showAgentPanel
                  ? 'grid gap-6 xl:grid-cols-[1fr_340px]'
                  : undefined
              }
            >
              <div>
                <SectionEyebrow
                  icon={FileText}
                  tint={TINT}
                  label="Document"
                  description="Edit the generated document directly"
                />
                {buffer ? (
                  <DocxEditor
                    ref={editorRef}
                    documentBuffer={buffer}
                    mode="editing"
                    showZoomControl={false}
                    documentName={sow.title}
                    documentNameEditable={false}
                    className="h-[36rem] rounded-md border"
                  />
                ) : (
                  <Skeleton className="h-[36rem] rounded-md border" />
                )}
              </div>
              {showAgentPanel && (
                <div className="xl:sticky xl:top-6 xl:self-start">
                  <SowAiAgentPanel sow={sow} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            className={
              showAgentPanel ? 'grid gap-6 lg:grid-cols-[1fr_360px]' : undefined
            }
          >
            <SowBuilderSections
              sow={sow}
              onDraftChange={(next) => {
                draftRef.current = next;
              }}
            />
            {showAgentPanel && <SowAiAgentPanel sow={sow} />}
          </div>
        )}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/sows/${sow.id}/print`} target="_blank" />}
          >
            Preview
          </Button>
          {variant === 'tenant-admin' && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/tenant-admin/templates" />}
            >
              Generate from Template
            </Button>
          )}
          <Button onClick={handleSubmitForApproval}>Submit for Approval</Button>
        </div>
      </TabsContent>

      <TabsContent value="workflow">
        <div className="mb-6">
          <SowStateStrip status={sow.status} />
        </div>
        {sow.status === 'in_review' ||
        sow.status === 'changes_requested' ||
        sow.status === 'rejected' ||
        sow.status === 'approved' ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Workflow Instance Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowTimeline steps={latestRevision.workflowInstanceSteps} />
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            No workflow instance attached — submit this SOW to start one.
          </p>
        )}
      </TabsContent>

      <TabsContent value="versions">
        <Surface>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sow.revisions.map((rev) => (
                <TableRow key={rev.id}>
                  <TableCell className="font-medium">V{rev.version}</TableCell>
                  <TableCell>
                    <SowStatusBadge status={rev.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rev.submittedAt ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Sheet>
                      <SheetTrigger
                        render={<Button variant="ghost" size="sm" />}
                      >
                        View snapshot
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>
                            {sow.number} — V{rev.version}
                          </SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-4 p-4 text-sm">
                          <div>
                            <div className="font-medium text-muted-foreground">
                              Status
                            </div>
                            <SowStatusBadge status={rev.status} />
                          </div>
                          <div>
                            <div className="font-medium text-muted-foreground">
                              Approval history
                            </div>
                            <WorkflowTimeline
                              steps={rev.workflowInstanceSteps}
                            />
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Surface>
      </TabsContent>

      <TabsContent value="files">
        <p className="text-sm text-muted-foreground">
          No attachments uploaded to this SOW yet.
        </p>
      </TabsContent>

      <TabsContent value="comments">
        <p className="mb-4 text-sm text-muted-foreground">
          Shared thread visible to Participants and the linked Client contact.
          Tenant Admins can view but not post here.
        </p>
        <SowCommentsPanel
          sowId={sow.id}
          currentAuthor={{ id: 'n/a', name: 'n/a', type: 'participant' }}
          canComment={false}
        />
      </TabsContent>

      <TabsContent value="audit">
        <ul className="flex flex-col gap-3">
          {relatedAudit.map((log) => (
            <li key={log.id} className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{log.action}</Badge>
              <span className="text-muted-foreground">{log.actor}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {log.timestamp}
              </span>
            </li>
          ))}
        </ul>
      </TabsContent>
    </Tabs>
  );
}
