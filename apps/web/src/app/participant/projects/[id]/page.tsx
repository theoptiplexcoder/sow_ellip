import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  FileText,
  ScrollText,
  User,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { Surface } from '@/components/shared/surface';
import { getProject, type ProjectMember } from '@/lib/data/projects';
import { getUser, type ProjectRole } from '@/lib/data/users';
import { sows } from '@/lib/data/sows';

const statusLabel: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

const roleLabel: Record<ProjectRole, string> = {
  creator: 'Creator',
  approver: 'Approver',
  executive_viewer: 'Executive Viewer',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function deadlineHint(deadline: string, status: string) {
  if (status === 'completed') return 'Project completed';
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `${days} days left`;
}

function MemberRow({ member }: { member: ProjectMember }) {
  const user = getUser(member.userId);
  if (!user) return null;
  return (
    <li>
      <Surface contentClassName="flex items-center gap-3 p-3">
        <Avatar>
          <AvatarFallback className="text-xs">
            {user.avatarInitials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          {member.roles.map((role) => (
            <Badge key={role} variant="outline" className="text-xs">
              {roleLabel[role]}
            </Badge>
          ))}
        </div>
      </Surface>
    </li>
  );
}

export default async function ParticipantProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const projectSows = sows.filter((s) => s.projectId === project.id);

  return (
    <div>
      <Link
        href="/participant/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Projects
      </Link>
      <PageHeader
        title={project.name}
        description={project.clientName}
        actions={
          <Badge variant="outline" className="capitalize">
            {statusLabel[project.status]}
          </Badge>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sows">SOWs</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Owner" value={project.owner} icon={User} />
            <StatCard label="SOWs" value={project.sowCount} icon={ScrollText} />
            <StatCard
              label="Members"
              value={project.members.length}
              icon={Users}
            />
            {project.deadline && (
              <StatCard
                label="Deadline"
                value={formatDate(project.deadline)}
                icon={CalendarClock}
                hint={deadlineHint(project.deadline, project.status)}
              />
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {project.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {project.requirements && project.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-2.5">
                      {project.requirements.map((r) => (
                        <li key={r} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {(project.startDate || project.deadline) && (
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {project.startDate && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <CalendarRange className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Kickoff</p>
                        <p className="text-sm font-medium">
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                    </div>
                  )}
                  {project.deadline && (
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        <CalendarClock className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Deadline
                        </p>
                        <p className="text-sm font-medium">
                          {formatDate(project.deadline)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sows" className="mt-4">
          <Surface>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectSows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/participant/my-sows/${s.id}`}
                        className="hover:underline"
                      >
                        {s.number}
                      </Link>
                    </TableCell>
                    <TableCell>{s.title}</TableCell>
                    <TableCell>
                      <SowStatusBadge status={s.status} />
                    </TableCell>
                  </TableRow>
                ))}
                {projectSows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No SOWs under this project yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Surface>
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <ul className="flex flex-col gap-2">
            {project.members.map((m) => (
              <MemberRow key={m.userId} member={m} />
            ))}
            {project.members.length === 0 && (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No members assigned.
              </p>
            )}
          </ul>
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <ul className="flex flex-col gap-2">
            {project.files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate font-medium">{f.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {f.uploadedAt}
                </span>
              </li>
            ))}
            {project.files.length === 0 && (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                No files uploaded.
              </p>
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
