import Link from 'next/link';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { StatusPill } from '@/components/shared/status-badge';
import {
  workflowTemplates,
  type WorkflowTemplate,
} from '@/lib/data/workflow-templates';

export default function ParticipantWorkflowsPage() {
  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Approval workflows configured by your tenant admin."
      />

      <DataList<WorkflowTemplate>
        data={workflowTemplates}
        getRowKey={(w) => w.id}
        emptyMessage="No workflow templates have been configured yet."
        columns={[
          {
            header: 'Workflow',
            className: 'font-medium',
            cell: (w) => (
              <Link
                href={`/participant/workflows/${w.id}`}
                className="hover:underline"
              >
                {w.name}
              </Link>
            ),
          },
          {
            header: 'Steps',
            cell: (w) => w.steps.length,
          },
          {
            header: 'Status',
            cell: (w) => (
              <StatusPill
                active={w.status === 'active'}
                activeLabel="Active"
                inactiveLabel={
                  w.status === 'archived' ? 'Archived' : 'Inactive'
                }
              />
            ),
          },
          {
            header: 'Updated',
            className: 'text-muted-foreground',
            cell: (w) => w.updatedAt,
          },
        ]}
        renderCard={(w) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/participant/workflows/${w.id}`}
                className="font-medium hover:underline"
              >
                {w.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {w.steps.length} {w.steps.length === 1 ? 'step' : 'steps'}
                </span>
                <span>·</span>
                <span>Updated {w.updatedAt}</span>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 capitalize">
              {w.status}
            </Badge>
          </div>
        )}
      />
    </div>
  );
}
