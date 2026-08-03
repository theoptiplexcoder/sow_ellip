'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DocxEditorRef } from '@eigenpal/docx-editor-react';
import {
  AlertTriangle,
  Building2,
  FileText,
  FormInput,
  History,
  MessageSquare,
  Paperclip,
  ScrollText,
  Workflow as WorkflowIcon,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { SowBuilderSections } from '@/components/shared/sow-builder-sections';
import { SowExportActions } from '@/components/shared/sow-export-actions';
import { SowStateStrip } from '@/components/shared/sow-state-strip';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { Surface } from '@/components/shared/surface';
import { WorkflowTimeline } from '@/components/shared/workflow-timeline';
import { SowDocumentActions } from '@/components/participant/sow-document-actions';
import { SowDocumentViewer } from '@/components/participant/sow-document-viewer';
import { SowAiAgentPanel } from '@/components/shared/sow-ai-agent-panel';
import { SowCommentsPanel } from '@/components/shared/sow-comments-panel';
import {
  setSowWorkflowTemplate,
  type Sow,
  submitSowForApproval,
  updateSow,
} from '@/lib/data/sows';
import { currentUsers } from '@/lib/data/current-user';
import { hasAnyProviderApiKey } from '@/lib/data/ai-settings';
import { getTemplate } from '@/lib/data/templates';
import { generateDocxBlob } from '@/lib/docx/generate-docx';
import { fillPlaceholders, placeholderLabel } from '@/lib/docx/placeholders';
import { parseDocxFile } from '@/lib/docx/parse-docx';
import { auditLogs } from '@/lib/data/audit-logs';
import { workflowTemplates } from '@/lib/data/workflow-templates';

const DocxEditor = dynamic(
  () => import('@eigenpal/docx-editor-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[36rem] rounded-md border" />,
  },
);

const TINT = 'var(--status-pending)';

export function ParticipantSowDetail({
  sow,
  showConflictBanner = false,
}: {
  sow: Sow;
  showConflictBanner?: boolean;
}) {
  const router = useRouter();
  const isDraft = sow.status === 'draft';
  const template = sow.templateId ? getTemplate(sow.templateId) : undefined;
  const isTemplated = isDraft && !!template;
  const showAgentPanel = hasAnyProviderApiKey();

  const draftRef = useRef(sow.sections);
  const [values, setValues] = useState<Record<string, string>>(
    sow.placeholderValues ?? {},
  );
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [saving, setSaving] = useState(false);
  const [workflowTemplateId, setWorkflowTemplateId] = useState(
    sow.workflowTemplateId ?? '',
  );
  const editorRef = useRef<DocxEditorRef>(null);
  const activeWorkflowTemplates = workflowTemplates.filter(
    (w) => w.status === 'active',
  );

  const latestRevision = sow.revisions[sow.revisions.length - 1];
  const relatedAudit = auditLogs.filter(
    (a) => a.entityName.includes(sow.number) || a.entityType === 'SOW',
  );

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

  function handleWorkflowTemplateChange(id: string) {
    const wf = workflowTemplates.find((w) => w.id === id);
    if (!wf) return;
    setWorkflowTemplateId(id);
    setSowWorkflowTemplate(sow.id, id, wf.name);
    router.refresh();
  }

  function handleSubmitForApproval() {
    if (!workflowTemplateId) return;
    submitSowForApproval(sow.id);
    toast.success('Submitted for approval');
    router.refresh();
  }

  return (
    <Tabs defaultValue="document">
      <TabsList>
        <TabsTrigger value="document">Document</TabsTrigger>
        <TabsTrigger value="details">Other Details</TabsTrigger>
      </TabsList>

      <TabsContent value="document">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SowStateStrip status={sow.status} />
          <SowExportActions sowId={sow.id} />
        </div>

        {showConflictBanner && (
          <Alert className="mb-4" variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>This draft was updated elsewhere</AlertTitle>
            <AlertDescription>
              Reload to see the latest version before continuing.
            </AlertDescription>
          </Alert>
        )}

        {isDraft ? (
          isTemplated && template ? (
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
                {showAgentPanel && (
                  <div>
                    <SowAiAgentPanel sow={sow} />
                  </div>
                )}
                <aside className="xl:sticky xl:top-6 xl:self-start">
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
                </aside>
              </div>
            </div>
          ) : (
            <div
              className={
                showAgentPanel
                  ? 'grid gap-6 lg:grid-cols-[1fr_360px]'
                  : undefined
              }
            >
              <SowBuilderSections
                key={sow.updatedAt}
                sow={sow}
                onDraftChange={(next) => {
                  draftRef.current = next;
                }}
              />
              {showAgentPanel && <SowAiAgentPanel sow={sow} />}
            </div>
          )
        ) : (
          <div className="flex flex-col gap-4">
            <SowDocumentActions sow={sow} />
            <SowDocumentViewer sow={sow} />
          </div>
        )}

        {isDraft && (
          <div className="mt-6">
            <SectionEyebrow
              icon={WorkflowIcon}
              tint={TINT}
              label="Workflow"
              description="Choose the approval workflow for this SOW"
            />
            <Card>
              <CardContent className="flex flex-col gap-2 pt-6 sm:max-w-sm">
                <Label htmlFor="workflow-template">Workflow template</Label>
                <Select
                  value={workflowTemplateId}
                  onValueChange={(v: string | null) =>
                    v && handleWorkflowTemplateChange(v)
                  }
                >
                  <SelectTrigger id="workflow-template">
                    <SelectValue placeholder="Select a workflow template" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeWorkflowTemplates.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Set by tenant admins under Workflow Templates. Required before
                  submitting for approval.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {isDraft && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            {!workflowTemplateId && (
              <p className="mr-auto text-xs text-muted-foreground">
                Select a workflow template above before submitting.
              </p>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/sows/${sow.id}/print`} target="_blank" />}
            >
              Preview
            </Button>
            <Button
              onClick={handleSubmitForApproval}
              disabled={!workflowTemplateId}
            >
              Submit for Approval
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="details">
        <div className="flex flex-col gap-10">
          <section>
            <SectionEyebrow
              icon={Building2}
              tint={TINT}
              label="Overview"
              description={`${sow.clientName} · ${sow.projectName}`}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    Client
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-medium">
                  {sow.clientName}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    Project
                  </CardTitle>
                </CardHeader>
                <CardContent className="font-medium">
                  {sow.projectName}
                </CardContent>
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
                  {sow.workflowTemplateName || (
                    <span className="text-muted-foreground">Not selected</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <SectionEyebrow
              icon={WorkflowIcon}
              tint={TINT}
              label="Workflow"
              description="Approval steps for the current revision"
            />
            {sow.status === 'in_review' ||
            sow.status === 'changes_requested' ||
            sow.status === 'rejected' ||
            sow.status === 'approved' ? (
              <Card>
                <CardContent className="pt-6">
                  <WorkflowTimeline
                    steps={latestRevision.workflowInstanceSteps}
                  />
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">
                No workflow instance attached — submit this SOW to start one.
              </p>
            )}
          </section>

          <section>
            <SectionEyebrow
              icon={History}
              tint={TINT}
              label="Versions"
              description={`${sow.revisions.length} revision${sow.revisions.length === 1 ? '' : 's'}`}
            />
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
                      <TableCell className="font-medium">
                        V{rev.version}
                      </TableCell>
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
          </section>

          <section>
            <SectionEyebrow
              icon={Paperclip}
              tint={TINT}
              label="Files"
              description="Attachments uploaded to this SOW"
            />
            <p className="text-sm text-muted-foreground">
              No attachments uploaded to this SOW yet.
            </p>
          </section>

          <section>
            <SectionEyebrow
              icon={MessageSquare}
              tint={TINT}
              label="Comments"
              description="Shared thread with the linked Client contact"
            />
            <SowCommentsPanel
              sowId={sow.id}
              currentAuthor={{
                id: currentUsers.participant.id,
                name: currentUsers.participant.name,
                type: 'participant',
              }}
              canComment
            />
          </section>

          <section>
            <SectionEyebrow
              icon={ScrollText}
              tint={TINT}
              label="Audit"
              description="Recent activity on this SOW"
            />
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
          </section>
        </div>
      </TabsContent>
    </Tabs>
  );
}
