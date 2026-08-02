import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { WorkflowBuilder } from '@/components/tenant-admin/workflow-builder';
import { getWorkflowTemplate } from '@/lib/data/workflow-templates';

const statusVariant: Record<string, 'default' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
  archived: 'outline',
};

export default async function WorkflowTemplateDetailPage({
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
        href="/tenant-admin/workflow-templates"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Workflow Templates
      </Link>
      <PageHeader
        title={wf.name}
        description="Drag steps to reorder. Editing this template never affects in-flight approvals."
        actions={
          <Badge variant={statusVariant[wf.status]} className="capitalize">
            {wf.status}
          </Badge>
        }
      />

      <WorkflowBuilder templateId={wf.id} steps={wf.steps} />
    </div>
  );
}
