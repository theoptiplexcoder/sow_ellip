'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { AlertTriangle } from 'lucide-react';
import { SowBuilderSections } from '@/components/shared/sow-builder-sections';
import { SowCommentsPanel } from '@/components/shared/sow-comments-panel';
import { SowExportActions } from '@/components/shared/sow-export-actions';
import { SowStateStrip } from '@/components/shared/sow-state-strip';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { WorkflowTimeline } from '@/components/shared/workflow-timeline';
import { type Sow, submitSowForApproval, updateSow } from '@/lib/data/sows';
import { auditLogs } from '@/lib/data/audit-logs';

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

  function handleSaveDraft() {
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
        <SowBuilderSections
          sow={sow}
          onDraftChange={(next) => {
            draftRef.current = next;
          }}
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
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
        <div className="rounded-md border">
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
        </div>
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
