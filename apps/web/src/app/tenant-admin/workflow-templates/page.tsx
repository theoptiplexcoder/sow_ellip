'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronRight, Workflow } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, cn } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatusPill } from '@/components/shared/status-badge';
import { NewWorkflowTemplateDialog } from '@/components/tenant-admin/new-workflow-template-dialog';
import { WorkflowTemplateActionsMenu } from '@/components/tenant-admin/workflow-template-actions-menu';
import {
  workflowTemplates,
  type WorkflowTemplate,
} from '@/lib/data/workflow-templates';

type Filter = 'all' | 'active' | 'inactive' | 'archived';

export default function WorkflowTemplatesPage() {
  const [list, setList] = useState<WorkflowTemplate[]>(workflowTemplates);
  const [filter, setFilter] = useState<Filter>('all');
  const refresh = () => setList([...workflowTemplates]);

  const counts = useMemo(
    () => ({
      all: list.length,
      active: list.filter((w) => w.status === 'active').length,
      inactive: list.filter((w) => w.status === 'inactive').length,
      archived: list.filter((w) => w.status === 'archived').length,
    }),
    [list],
  );

  const visible = useMemo(
    () => (filter === 'all' ? list : list.filter((w) => w.status === filter)),
    [filter, list],
  );

  return (
    <div>
      <PageHeader
        title="Workflow Templates"
        description="Reusable, versioned approval workflows. Editing never affects in-flight approvals."
        actions={<NewWorkflowTemplateDialog onCreated={refresh} />}
      />

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          All <span className="text-muted-foreground">{counts.all}</span>
        </FilterButton>
        <FilterButton
          active={filter === 'active'}
          onClick={() => setFilter('active')}
        >
          Active <span className="text-muted-foreground">{counts.active}</span>
        </FilterButton>
        <FilterButton
          active={filter === 'inactive'}
          onClick={() => setFilter('inactive')}
        >
          Inactive{' '}
          <span className="text-muted-foreground">{counts.inactive}</span>
        </FilterButton>
        <FilterButton
          active={filter === 'archived'}
          onClick={() => setFilter('archived')}
        >
          Archived{' '}
          <span className="text-muted-foreground">{counts.archived}</span>
        </FilterButton>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No workflow templates in this filter yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((wf) => (
            <Card
              key={wf.id}
              className={cn(
                'gap-3 transition-shadow hover:shadow-md',
                wf.status === 'archived' && 'opacity-60 grayscale',
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Workflow className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        <Link
                          href={`/tenant-admin/workflow-templates/${wf.id}`}
                          className="hover:underline"
                        >
                          {wf.name}
                        </Link>
                      </CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Updated {wf.updatedAt}
                      </p>
                    </div>
                  </div>
                  <WorkflowTemplateActionsMenu
                    id={wf.id}
                    status={wf.status}
                    onChanged={refresh}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <StatusPill
                    active={wf.status === 'active'}
                    activeLabel="Active"
                    inactiveLabel={
                      wf.status === 'archived' ? 'Archived' : 'Inactive'
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    {wf.steps.length} {wf.steps.length === 1 ? 'step' : 'steps'}
                  </span>
                </div>

                {wf.steps.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-t pt-3">
                    {wf.steps.map((step, i) => (
                      <span key={step.id} className="flex items-center gap-1">
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                          {step.name}
                        </span>
                        {i < wf.steps.length - 1 && (
                          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}
