import Link from 'next/link';
import { ArrowRight, CheckCircle2, FolderKanban, Send, MessageSquareWarning, type LucideIcon } from 'lucide-react';
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

const STATS: { label: string; value: number; icon: LucideIcon; tone: 'neutral' | 'success' | 'warning' | 'info' }[] = [
  { label: 'Active projects', value: 2, icon: FolderKanban, tone: 'info' },
  { label: 'SOWs in review', value: 2, icon: Send, tone: 'info' },
  { label: 'Changes requested', value: 1, icon: MessageSquareWarning, tone: 'warning' },
  { label: 'Approved', value: 1, icon: CheckCircle2, tone: 'success' },
];

type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  project: string;
  status: Status;
  updatedAt: string;
};

const RECENT_SOWS: SowRow[] = [
  { id: 's-1', sowNumber: 'SOW-1042', title: 'Website revamp — Phase 1', project: 'Website revamp', status: 'APPROVED', updatedAt: '2026-07-20' },
  { id: 's-2', sowNumber: 'SOW-1051', title: 'Data migration plan', project: 'Data migration', status: 'IN_REVIEW', updatedAt: '2026-07-25' },
  { id: 's-4', sowNumber: 'SOW-1048', title: 'Phase 2 scope addendum', project: 'Website revamp', status: 'CHANGES_REQUESTED', updatedAt: '2026-07-18' },
];

export function ClientDashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your projects and SOWs, at a glance."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} />
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Recently updated SOWs</h2>
          <Link
            href="/client/sows"
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
              <Th>Project</Th>
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
                  <Td className="text-muted-foreground">{sow.project}</Td>
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
