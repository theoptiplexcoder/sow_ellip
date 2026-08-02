import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SowStateStrip } from '@/components/shared/sow-state-strip';
import { WorkflowTimeline } from '@/components/shared/workflow-timeline';
import { ApproverDecisionPanel } from '@/components/participant/approver-decision-panel';
import { SowDocumentActions } from '@/components/participant/sow-document-actions';
import { SowDocumentViewer } from '@/components/participant/sow-document-viewer';
import { getSow } from '@/lib/data/sows';

export default async function ApproverScreenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sow = getSow(id);
  if (!sow) notFound();

  const latestRevision = sow.revisions[sow.revisions.length - 1];

  return (
    <div>
      <Link
        href="/participant/approvals"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Approvals
      </Link>
      <PageHeader
        title={`${sow.number} — ${sow.title}`}
        description={`${sow.clientName} · ${sow.projectName}`}
      />

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <SowStateStrip status={sow.status} />
          <SowDocumentActions sow={sow} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <Card>
            <CardContent className="pt-6">
              <SowDocumentViewer sow={sow} />
            </CardContent>
          </Card>
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2">
          <ApproverDecisionPanel />
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
        </div>
      </div>
    </div>
  );
}
