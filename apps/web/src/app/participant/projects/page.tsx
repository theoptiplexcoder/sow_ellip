import Link from 'next/link';
import { Badge } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { NewProjectDialog } from '@/components/participant/new-project-dialog';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectsForUser, type Project } from '@/lib/data/projects';

const statusLabel: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export default function ParticipantProjectsPage() {
  const me = currentUsers.participant;
  const myProjects = getProjectsForUser(me.id);

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Projects you're assigned to."
        actions={<NewProjectDialog />}
      />

      <DataList<Project>
        data={myProjects}
        getRowKey={(p) => p.id}
        emptyMessage="You have no project assignments yet."
        columns={[
          {
            header: 'Project',
            className: 'font-medium',
            cell: (p) => (
              <Link
                href={`/participant/projects/${p.id}`}
                className="hover:underline"
              >
                {p.name}
              </Link>
            ),
          },
          {
            header: 'Client',
            className: 'text-muted-foreground',
            cell: (p) => p.clientName,
          },
          { header: 'SOWs', cell: (p) => p.sowCount },
          {
            header: 'Status',
            cell: (p) => (
              <Badge variant="outline" className="capitalize">
                {statusLabel[p.status]}
              </Badge>
            ),
          },
        ]}
        renderCard={(p) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/participant/projects/${p.id}`}
                className="font-medium hover:underline"
              >
                {p.name}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{p.clientName}</span>
                <span>·</span>
                <span>{p.sowCount} SOWs</span>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 capitalize">
              {statusLabel[p.status]}
            </Badge>
          </div>
        )}
      />
    </div>
  );
}
