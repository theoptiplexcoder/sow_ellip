'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { SowStatusBadge } from '@/components/shared/status-badge';
import {
  sowStatusLabels,
  sows,
  type Sow,
  type SowStatus,
} from '@/lib/data/sows';

export default function SowsListPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | SowStatus>('all');

  const filtered = useMemo(() => {
    return sows.filter((s) => {
      const matchesQuery =
        query.trim() === '' ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.number.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || s.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div>
      <PageHeader
        title="SOWs"
        description="All statements of work across the tenant."
        actions={
          <Button>
            <Plus className="size-4" />
            Create
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search SOWs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(sowStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataList<Sow>
        data={filtered}
        getRowKey={(s) => s.id}
        emptyMessage="No SOWs match your filters."
        columns={[
          {
            header: 'Number',
            className: 'font-medium',
            cell: (s) => (
              <Link
                href={`/tenant-admin/sows/${s.id}`}
                className="hover:underline"
              >
                {s.number}
              </Link>
            ),
          },
          { header: 'Title', cell: (s) => s.title },
          {
            header: 'Client',
            className: 'text-muted-foreground',
            cell: (s) => s.clientName,
          },
          {
            header: 'Project',
            className: 'text-muted-foreground',
            cell: (s) => s.projectName,
          },
          {
            header: 'Status',
            cell: (s) => <SowStatusBadge status={s.status} />,
          },
          { header: 'Version', cell: (s) => `V${s.version}` },
          {
            header: 'Updated',
            className: 'text-muted-foreground',
            cell: (s) => s.updatedAt,
          },
        ]}
        renderCard={(s) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/tenant-admin/sows/${s.id}`}
                  className="font-medium hover:underline"
                >
                  {s.number}
                </Link>
                <div className="truncate text-sm text-muted-foreground">
                  {s.title}
                </div>
              </div>
              <SowStatusBadge status={s.status} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span>{s.clientName}</span>
              <span>·</span>
              <span>{s.projectName}</span>
              <span>·</span>
              <span>V{s.version}</span>
              <span>·</span>
              <span>{s.updatedAt}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
