'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from '@sow-platform/ui';
import { updateProjectMembers, type ProjectMember } from '@/lib/data/projects';
import {
  type AppUser,
  type ProjectRole,
  users as allUsers,
} from '@/lib/data/users';

const roleLabels: Record<ProjectRole, string> = {
  creator: 'Creator',
  approver: 'Approver',
  executive_viewer: 'Executive Viewer',
};
const roleOrder: ProjectRole[] = ['creator', 'approver', 'executive_viewer'];

function UserChip({
  user,
  containerId,
}: {
  user: AppUser;
  containerId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: user.id,
      data: { containerId },
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? {
              transform: `translate(${transform.x}px, ${transform.y}px)`,
              zIndex: 20,
            }
          : undefined
      }
      className={cn(
        'flex touch-none cursor-grab items-center gap-2 rounded-md border bg-card p-2 active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <GripVertical className="size-4 shrink-0 text-muted-foreground" />
      <Avatar className="size-7">
        <AvatarFallback className="text-xs">
          {user.avatarInitials}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-sm">{user.name}</span>
    </div>
  );
}

function DropZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(className, isOver && 'ring-2 ring-primary ring-offset-2')}
    >
      {children}
    </div>
  );
}

export function ProjectMembersBoard({
  projectId,
  members: initialMembers,
}: {
  projectId: string;
  members: ProjectMember[];
}) {
  const [memberIds, setMemberIds] = useState<string[]>(
    initialMembers.map((m) => m.userId),
  );
  const [roles, setRoles] = useState<Record<string, ProjectRole[]>>(
    Object.fromEntries(initialMembers.map((m) => [m.userId, m.roles])),
  );

  useEffect(() => {
    updateProjectMembers(
      projectId,
      memberIds.map((userId) => ({ userId, roles: roles[userId] ?? [] })),
    );
  }, [projectId, memberIds, roles]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const availableUsers = useMemo(
    () => allUsers.filter((u) => !memberIds.includes(u.id)),
    [memberIds],
  );
  const memberUsers = useMemo(
    () =>
      memberIds
        .map((id) => allUsers.find((u) => u.id === id))
        .filter((u): u is AppUser => !!u),
    [memberIds],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const userId = active.id as string;
    const from = active.data.current?.containerId as string;
    const to = over.id as string;
    if (from === to) return;

    if (to === 'members') {
      setMemberIds((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
      setRoles((prev) => (prev[userId] ? prev : { ...prev, [userId]: [] }));
    } else if (to === 'available') {
      setMemberIds((prev) => prev.filter((id) => id !== userId));
    }
  }

  function toggleRole(userId: string, role: ProjectRole) {
    setRoles((prev) => {
      const current = prev[userId] ?? [];
      const next = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return { ...prev, [userId]: next };
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Available Users</CardTitle>
          </CardHeader>
          <CardContent>
            <DropZone
              id="available"
              className="flex min-h-40 flex-col gap-2 rounded-md border border-dashed p-2"
            >
              {availableUsers.map((u) => (
                <UserChip key={u.id} user={u} containerId="available" />
              ))}
              {availableUsers.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">
                  All users are assigned to this project.
                </p>
              )}
            </DropZone>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Project Members</CardTitle>
          </CardHeader>
          <CardContent>
            <DropZone
              id="members"
              className="flex min-h-40 flex-col gap-3 rounded-md border border-dashed p-2"
            >
              {memberUsers.map((u) => (
                <div key={u.id} className="rounded-md border p-2">
                  <UserChip user={u} containerId="members" />
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-9">
                    {roleOrder.map((role) => {
                      const active = roles[u.id]?.includes(role);
                      return (
                        <Badge
                          key={role}
                          onClick={() => toggleRole(u.id, role)}
                          variant={active ? 'default' : 'outline'}
                          className="cursor-pointer select-none"
                        >
                          {roleLabels[role]}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
              {memberUsers.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">
                  Drag users here to add them to this project.
                </p>
              )}
            </DropZone>
          </CardContent>
        </Card>
      </div>
    </DndContext>
  );
}
