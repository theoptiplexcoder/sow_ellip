import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileEdit, Send, XCircle, type LucideIcon } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { StatCard } from '../dashboard/stat-card';

type Status = 'DRAFT' | 'SUBMITTED' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'REJECTED' | 'APPROVED';

const STATUS_LABEL: Record<Status, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In review',
  CHANGES_REQUESTED: 'Changes requested',
  REJECTED: 'Rejected',
  APPROVED: 'Approved',
};

const STATUS_TONE: Record<Status, 'neutral' | 'info' | 'warning' | 'danger' | 'success'> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  IN_REVIEW: 'info',
  CHANGES_REQUESTED: 'warning',
  REJECTED: 'danger',
  APPROVED: 'success',
};

const STATS: { label: string; value: number; status: Status; icon: LucideIcon }[] = [
  { label: 'My drafts', value: 3, status: 'DRAFT', icon: FileEdit },
  { label: 'Submitted', value: 4, status: 'SUBMITTED', icon: Send },
  { label: 'Approved', value: 11, status: 'APPROVED', icon: CheckCircle2 },
  { label: 'Rejected', value: 1, status: 'REJECTED', icon: XCircle },
];

type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  client: string;
  status: Status;
  updatedAt: string;
};

const RECENT_SOWS: SowRow[] = [
  { id: 's-1', sowNumber: 'SOW-1051', title: 'Q3 Platform Migration', client: 'Northwind Traders', status: 'DRAFT', updatedAt: '3h ago' },
  { id: 's-2', sowNumber: 'SOW-1049', title: 'Support Retainer Renewal', client: 'Globex Corp', status: 'SUBMITTED', updatedAt: '1d ago' },
  { id: 's-3', sowNumber: 'SOW-1044', title: 'Data Warehouse Buildout', client: 'Initech', status: 'CHANGES_REQUESTED', updatedAt: '2d ago' },
  { id: 's-4', sowNumber: 'SOW-1042', title: 'Mobile App Phase 2', client: 'Umbrella Ltd', status: 'APPROVED', updatedAt: '4d ago' },
];

export function ParticipantDashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your SOWs, clients, and recent activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={STATUS_TONE[stat.status]}
          />
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recently updated SOWs</h2>
          <Link
            href="/participant/sows"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {RECENT_SOWS.length === 0 ? (
          <EmptyState message="No SOWs yet" />
        ) : (
          <Table>
            <TableHead>
              <Th>SOW</Th>
              <Th>Client</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
            </TableHead>
            <TableBody>
              {RECENT_SOWS.map((sow) => (
                <tr key={sow.id} className="transition-colors hover:bg-muted/40">
                  <Td>
                    <p className="font-medium text-foreground">{sow.title}</p>
                    <p className="text-xs text-muted-foreground">{sow.sowNumber}</p>
                  </Td>
                  <Td className="text-muted-foreground">{sow.client}</Td>
                  <Td>
                    <Badge tone={STATUS_TONE[sow.status]}>{STATUS_LABEL[sow.status]}</Badge>
                  </Td>
                  <Td className="text-xs text-muted-foreground">{sow.updatedAt}</Td>
                </tr>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
