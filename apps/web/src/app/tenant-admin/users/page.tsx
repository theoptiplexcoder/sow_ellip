'use client';

import { KeyRound, MoreVertical, Plus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { StatusPill } from '@/components/shared/status-badge';
import { users, type AppUser } from '@/lib/data/users';

function UserActionsMenu({ user }: { user: AppUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="User actions"
          />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => toast.success(`Password reset sent to ${user.email}`)}
        >
          <KeyRound className="size-4" />
          Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => toast.success(`${user.name} deactivated`)}
        >
          <UserX className="size-4" />
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Project-role assignment lives on each Project's Members tab, since roles are per-project."
        actions={
          <Button>
            <Plus className="size-4" />
            Invite User
          </Button>
        }
      />

      <DataList<AppUser>
        data={users}
        getRowKey={(u) => u.id}
        emptyMessage="No users yet."
        columns={[
          {
            header: '',
            cell: (u) => (
              <Avatar className="size-8">
                <AvatarFallback>{u.avatarInitials}</AvatarFallback>
              </Avatar>
            ),
          },
          { header: 'Name', className: 'font-medium', cell: (u) => u.name },
          {
            header: 'Email',
            className: 'text-muted-foreground',
            cell: (u) => u.email,
          },
          {
            header: 'Status',
            cell: (u) => <StatusPill active={u.status === 'active'} />,
          },
          { header: 'Projects', cell: (u) => u.projectCount },
          {
            header: 'Actions',
            className: 'text-right',
            cell: (u) => <UserActionsMenu user={u} />,
          },
        ]}
        renderCard={(u) => (
          <div className="flex items-start gap-3">
            <Avatar className="size-9">
              <AvatarFallback>{u.avatarInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">{u.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {u.email}
                  </div>
                </div>
                <UserActionsMenu user={u} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill active={u.status === 'active'} />
                <span className="text-xs text-muted-foreground">
                  {u.projectCount} projects
                </span>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
