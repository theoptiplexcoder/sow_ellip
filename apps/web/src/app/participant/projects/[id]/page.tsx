import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import {
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
import { SowStatusBadge } from '@/components/shared/status-badge';
import { getProject } from '@/lib/data/projects';
import { sows } from '@/lib/data/sows';

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
      <PageHeader title={project.name} description={project.clientName} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sows">SOWs</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Owner:{' '}
            <span className="font-medium text-foreground">{project.owner}</span>
          </p>
        </TabsContent>

        <TabsContent value="sows" className="mt-4">
          <div className="overflow-hidden rounded-lg border">
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
          </div>
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
