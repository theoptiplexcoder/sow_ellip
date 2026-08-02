import Link from 'next/link';
import { Button } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { DataList } from '@/components/shared/data-list';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectsForUser } from '@/lib/data/projects';
import { sows, type Sow } from '@/lib/data/sows';
import { averageReviewDays } from '@/lib/sow-metrics';
import { CheckCircle2, Clock, Inbox, XCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const me = currentUsers.participant;
  const approverProjects = getProjectsForUser(me.id, 'approver');
  const approverSows = sows.filter((s) =>
    approverProjects.some((p) => p.id === s.projectId),
  );
  const pending = approverSows.filter((s) => s.status === 'in_review');
  const approved = approverSows.filter((s) => s.status === 'approved');
  const rejected = approverSows.filter((s) => s.status === 'rejected');
  const avgReviewDays = averageReviewDays(approverSows);

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="SOWs awaiting your decision, across your Approver-role projects."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending" value={pending.length} icon={Clock} />
        <StatCard
          label="Approved Today"
          value={approved.length}
          icon={CheckCircle2}
        />
        <StatCard label="Rejected" value={rejected.length} icon={XCircle} />
        <StatCard
          label="Average Review Time"
          value={
            avgReviewDays === null ? '—' : `${avgReviewDays.toFixed(1)} days`
          }
        />
      </div>

      <h2 className="mt-8 mb-3 font-display text-lg font-semibold tracking-tight">
        Pending your decision
      </h2>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Inbox className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">You have no pending approvals</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When a SOW is submitted on one of your Approver-role projects, it
            will show up here for review.
          </p>
        </div>
      ) : (
        <DataList<Sow>
          data={pending}
          getRowKey={(s) => s.id}
          emptyMessage="No SOWs pending your review."
          columns={[
            { header: 'SOW', className: 'font-medium', cell: (s) => s.title },
            {
              header: 'Project',
              className: 'text-muted-foreground',
              cell: (s) => s.projectName,
            },
            { header: 'Requester', cell: (s) => s.creator },
            {
              header: '',
              className: 'text-right',
              cell: (s) => (
                <Button
                  size="sm"
                  render={<Link href={`/participant/approvals/${s.id}`} />}
                >
                  Review
                </Button>
              ),
            },
          ]}
          renderCard={(s) => (
            <div className="flex flex-col gap-2">
              <div className="min-w-0">
                <div className="truncate font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">
                  {s.projectName} · requested by {s.creator}
                </div>
              </div>
              <Button
                size="sm"
                className="w-full"
                render={<Link href={`/participant/approvals/${s.id}`} />}
              >
                Review
              </Button>
            </div>
          )}
        />
      )}
    </div>
  );
}
