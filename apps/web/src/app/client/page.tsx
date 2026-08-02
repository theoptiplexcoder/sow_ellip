import Link from 'next/link';
import { Button } from '@sow-platform/ui';
import { DataList } from '@/components/shared/data-list';
import { PageHeader } from '@/components/shared/page-header';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectIdsForClientContact } from '@/lib/data/client-access';
import { sows, type Sow } from '@/lib/data/sows';

export default function ClientDashboardPage() {
  const projectIds = getProjectIdsForClientContact(currentUsers.client.id);
  const visibleSows = sows.filter(
    (s) => projectIds.includes(s.projectId) && s.status !== 'draft',
  );

  return (
    <div>
      <PageHeader
        title="My SOWs"
        description="Statements of Work shared with you on your linked project(s)."
      />
      <DataList<Sow>
        data={visibleSows}
        getRowKey={(s) => s.id}
        emptyMessage="No SOWs have been shared with you yet."
        columns={[
          {
            header: 'Number',
            className: 'font-medium',
            cell: (s) => (
              <Link href={`/client/sows/${s.id}`} className="hover:underline">
                {s.number}
              </Link>
            ),
          },
          { header: 'Title', cell: (s) => s.title },
          {
            header: 'Project',
            className: 'text-muted-foreground',
            cell: (s) => s.projectName,
          },
          {
            header: 'Status',
            cell: (s) => <SowStatusBadge status={s.status} />,
          },
          {
            header: 'Updated',
            className: 'text-muted-foreground',
            cell: (s) => s.updatedAt,
          },
        ]}
        renderCard={(s) => (
          <div className="flex flex-col gap-3">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground">
                {s.number} · {s.projectName}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <SowStatusBadge status={s.status} />
              <Button
                size="sm"
                variant="outline"
                render={<Link href={`/client/sows/${s.id}`} />}
              >
                View
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
