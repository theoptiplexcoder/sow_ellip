import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { StatusPill } from '@/components/shared/status-badge';
import { getClient } from '@/lib/data/clients';
import { projects } from '@/lib/data/projects';
import { auditLogs } from '@/lib/data/audit-logs';

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = getClient(id);
  if (!client) notFound();

  const clientProjects = projects.filter((p) => p.clientId === client.id);

  return (
    <div>
      <Link
        href="/tenant-admin/clients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Clients
      </Link>
      <PageHeader
        title={client.company}
        description={`Owner: ${client.owner}`}
        actions={<StatusPill active={client.status === 'active'} />}
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {client.projectCount}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Created
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {client.createdAt}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {client.contacts.length}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>SOWs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientProjects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/tenant-admin/projects/${p.id}`}
                        className="hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.owner}</TableCell>
                    <TableCell>{p.sowCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="contacts">
          <div className="grid gap-4 sm:grid-cols-2">
            {client.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-6">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contact.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {contact.email}
                  </div>
                </CardContent>
              </Card>
            ))}
            {client.contacts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No contacts on file.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <ul className="flex flex-col gap-2">
            {client.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center gap-2 rounded-md border p-3 text-sm"
              >
                <FileText className="size-4 text-muted-foreground" />
                <span className="font-medium">{doc.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {doc.uploadedAt}
                </span>
              </li>
            ))}
            {client.documents.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No documents uploaded.
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
