import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback, Badge, Button } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { projects, type Project } from '@/lib/data/projects';
import { getUser } from '@/lib/data/users';

const statusLabel: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Manage projects tenant-wide."
        actions={
          <Button>
            <Plus className="size-4" />
            New Project
          </Button>
        }
      />

      <DataList<Project>
        data={projects}
        getRowKey={(p) => p.id}
        emptyMessage="No projects yet."
        columns={[
          {
            header: 'Project',
            className: 'font-medium',
            cell: (p) => (
              <Link
                href={`/tenant-admin/projects/${p.id}`}
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
          { header: 'Owner', cell: (p) => p.owner },
          {
            header: 'Members',
            cell: (p) => (
              <div className="flex -space-x-2">
                {p.members.slice(0, 4).map((m) => {
                  const user = getUser(m.userId);
                  return (
                    <Avatar
                      key={m.userId}
                      className="size-7 border-2 border-background"
                    >
                      <AvatarFallback className="text-[10px]">
                        {user?.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
            ),
          },
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
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/tenant-admin/projects/${p.id}`}
                  className="font-medium hover:underline"
                >
                  {p.name}
                </Link>
                <div className="truncate text-sm text-muted-foreground">
                  {p.clientName}
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 capitalize">
                {statusLabel[p.status]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Owner: {p.owner}
              </span>
              <div className="flex -space-x-2">
                {p.members.slice(0, 4).map((m) => {
                  const user = getUser(m.userId);
                  return (
                    <Avatar
                      key={m.userId}
                      className="size-6 border-2 border-background"
                    >
                      <AvatarFallback className="text-[9px]">
                        {user?.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
