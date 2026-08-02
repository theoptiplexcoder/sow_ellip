import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { WorkflowFlowDiagram } from '@/components/tenant-admin/workflow-flow-diagram';
import { getWorkflowTemplate } from '@/lib/data/workflow-templates';

const statusVariant: Record<string, 'default' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
  archived: 'outline',
};

export default async function ParticipantWorkflowDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const wf = getWorkflowTemplate(id);
  if (!wf) notFound();

  return (
    <div>
      <Link
        href="/participant/workflows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Workflows
      </Link>
      <PageHeader
        title={wf.name}
        description="Approval steps for this workflow, in order."
        actions={
          <Badge variant={statusVariant[wf.status]} className="capitalize">
            {wf.status}
          </Badge>
        }
      />

      <WorkflowFlowDiagram steps={wf.steps} />
    </div>
  );
}
