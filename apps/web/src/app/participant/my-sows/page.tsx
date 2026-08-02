import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectsForUser } from '@/lib/data/projects';
import { sows, type Sow } from '@/lib/data/sows';

export default function MySowsPage() {
  const me = currentUsers.participant;
  const creatorProjects = getProjectsForUser(me.id, 'creator');
  const mySows = sows.filter((s) =>
    creatorProjects.some((p) => p.id === s.projectId),
  );

  return (
    <div>
      <PageHeader
        title="My SOWs"
        description="Statements of work you've created, across your Creator-role projects."
        actions={
          <Button
            nativeButton={false}
            render={<Link href="/participant/my-sows/new" />}
          >
            <Plus className="size-4" />
            New SOW
          </Button>
        }
      />

      <DataList<Sow>
        data={mySows}
        getRowKey={(s) => s.id}
        emptyMessage="You haven't created any SOWs yet."
        columns={[
          {
            header: 'Number',
            className: 'font-medium',
            cell: (s) => (
              <Link
                href={`/participant/my-sows/${s.id}`}
                className="hover:underline"
              >
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
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/participant/my-sows/${s.id}`}
                  className="font-medium hover:underline"
                >
                  {s.number}
                </Link>
                <div className="truncate text-sm text-muted-foreground">
                  {s.title}
                </div>
              </div>
              <SowStatusBadge status={s.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{s.projectName}</span>
              <span>·</span>
              <span>{s.updatedAt}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
