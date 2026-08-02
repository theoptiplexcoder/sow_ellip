'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Badge, Input } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { StatusPill } from '@/components/shared/status-badge';
import { NewClientDialog } from '@/components/tenant-admin/new-client-dialog';
import { clients, type Client } from '@/lib/data/clients';

export default function ClientsPage() {
  const [query, setQuery] = useState('');
  const [clientList, setClientList] = useState<Client[]>(clients);

  const filtered = useMemo(
    () =>
      clientList.filter((c) =>
        c.company.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, clientList],
  );

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage clients tenant-wide."
        actions={
          <NewClientDialog onCreated={() => setClientList([...clients])} />
        }
      />

      <Input
        placeholder="Search clients..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4 max-w-xs"
      />

      <DataList<Client>
        data={filtered}
        getRowKey={(c) => c.id}
        emptyMessage="No clients match your search."
        columns={[
          {
            header: 'Company',
            className: 'font-medium',
            cell: (c) => (
              <Link
                href={`/tenant-admin/clients/${c.id}`}
                className="hover:underline"
              >
                {c.company}
              </Link>
            ),
          },
          {
            header: 'Projects',
            cell: (c) => <Badge variant="outline">{c.projectCount}</Badge>,
          },
          { header: 'Owner', cell: (c) => c.owner },
          {
            header: 'Created',
            className: 'text-muted-foreground',
            cell: (c) => c.createdAt,
          },
          {
            header: 'Status',
            cell: (c) => <StatusPill active={c.status === 'active'} />,
          },
        ]}
        renderCard={(c) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/tenant-admin/clients/${c.id}`}
                className="font-medium hover:underline"
              >
                {c.company}
              </Link>
              <StatusPill active={c.status === 'active'} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <Badge variant="outline">{c.projectCount} projects</Badge>
              <span>{c.owner}</span>
              <span>·</span>
              <span>{c.createdAt}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}
