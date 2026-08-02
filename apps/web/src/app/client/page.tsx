import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SowStatusBadge } from '@/components/shared/status-badge';
import { currentUsers } from '@/lib/data/current-user';
import { getProjectIdsForClientContact } from '@/lib/data/client-access';
import { sows } from '@/lib/data/sows';

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleSows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/client/sows/${s.id}`}
                    className="hover:underline"
                  >
                    {s.number}
                  </Link>
                </TableCell>
                <TableCell>{s.title}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.projectName}
                </TableCell>
                <TableCell>
                  <SowStatusBadge status={s.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.updatedAt}
                </TableCell>
              </TableRow>
            ))}
            {visibleSows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No SOWs have been shared with you yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
