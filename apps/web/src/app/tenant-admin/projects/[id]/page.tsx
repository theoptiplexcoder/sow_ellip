import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, ScrollText, User, Users } from 'lucide-react';
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { ProjectMembersBoard } from '@/components/tenant-admin/project-members-board';
import { getProject } from '@/lib/data/projects';
import { sows } from '@/lib/data/sows';
import { auditLogs } from '@/lib/data/audit-logs';

const statusLabel: Record<string, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export default async function ProjectDetailPage({
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
        href="/tenant-admin/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Owner" value={project.owner} icon={User} />
          <StatCard label="SOWs" value={project.sowCount} icon={ScrollText} />
          <StatCard
            label="Members"
            value={project.members.length}
            icon={Users}
          />
        </TabsContent>

        <TabsContent value="sows">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectSows.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/tenant-admin/sows/${s.id}`}
                        className="hover:underline"
                      >
                        {s.number}
                      </Link>
                    </TableCell>
                    <TableCell>{s.title}</TableCell>
                    <TableCell>
                      <SowStatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.updatedAt}
                    </TableCell>
                  </TableRow>
                ))}
                {projectSows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No SOWs yet for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <p className="mb-4 text-sm text-muted-foreground">
            Drag users between lists to assign them to this project, then toggle
            their project role(s). A user can hold multiple role chips at once.
          </p>
          <ProjectMembersBoard members={project.members} />
        </TabsContent>

        <TabsContent value="workflow">
          <p className="text-sm text-muted-foreground">
            Workflow templates are configured tenant-wide under{' '}
            <Link href="/tenant-admin/workflow-templates" className="underline">
              Workflow Templates
            </Link>
            . Individual SOW approval progress lives on each SOW&apos;s Workflow
            tab.
          </p>
        </TabsContent>

        <TabsContent value="files">
          <ul className="flex flex-col gap-2">
            {project.files.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-md border p-3 text-sm"
              >
                <FileText className="size-4 text-muted-foreground" />
                <span className="font-medium">{f.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {f.uploadedAt}
                </span>
              </li>
            ))}
            {project.files.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No files uploaded.
              </p>
            )}
          </ul>
        </TabsContent>

        <TabsContent value="audit">
          <ul className="flex flex-col gap-3">
            {auditLogs.slice(0, 4).map((log) => (
              <li key={log.id} className="text-sm">
                <span className="font-medium">{log.actor}</span>{' '}
                <span className="text-muted-foreground">{log.action}</span>{' '}
                <span className="font-medium">{log.entityName}</span>
                <div className="text-xs text-muted-foreground">
                  {log.timestamp}
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
