import Link from 'next/link';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { NewWorkflowTemplateDialog } from '@/components/tenant-admin/new-workflow-template-dialog';
import { WorkflowTemplateActionsMenu } from '@/components/tenant-admin/workflow-template-actions-menu';
import { workflowTemplates } from '@/lib/data/workflow-templates';

const statusVariant: Record<string, 'default' | 'outline' | 'secondary'> = {
  active: 'default',
  inactive: 'secondary',
  archived: 'outline',
};

export default function WorkflowTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Workflow Templates"
        description="Reusable, versioned approval workflows. Editing never affects in-flight approvals."
        actions={<NewWorkflowTemplateDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workflowTemplates.map((wf) => (
          <Card
            key={wf.id}
            className={
              wf.status === 'archived' ? 'opacity-50 grayscale' : undefined
            }
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/tenant-admin/workflow-templates/${wf.id}`}
                    className="hover:underline"
                  >
                    {wf.name}
                  </Link>
                </CardTitle>
                <WorkflowTemplateActionsMenu id={wf.id} status={wf.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge
                  variant={statusVariant[wf.status]}
                  className="capitalize"
                >
                  {wf.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {wf.steps.length} steps
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Updated {wf.updatedAt}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
