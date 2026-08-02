'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { DataList } from '@/components/shared/data-list';
import { StatusPill } from '@/components/shared/status-badge';
import { CreateOrganizationDialog } from '@/components/superadmin/create-organization-dialog';
import { organizations, type Organization } from '@/lib/data/organizations';

export default function OrganizationsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'disabled'>('all');

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      const matchesQuery =
        query.trim() === '' ||
        org.name.toLowerCase().includes(query.toLowerCase()) ||
        org.slug.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || org.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Every tenant on the platform. Superadmin scope stops at tenant existence."
        actions={<CreateOrganizationDialog />}
      />

      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
        All Organizations{' '}
        <span className="text-muted-foreground font-normal">
          ({filtered.length})
        </span>
      </h2>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataList<Organization>
        data={filtered}
        getRowKey={(org) => org.id}
        emptyMessage="No organizations match your filters."
        columns={[
          {
            header: 'Organization',
            className: 'font-medium',
            cell: (org) => (
              <>
                <Link
                  href={`/superadmin/organizations/${org.id}`}
                  className="hover:underline"
                >
                  {org.name}
                </Link>
                <div className="text-xs text-muted-foreground">{org.slug}</div>
              </>
            ),
          },
          { header: 'Users', cell: (org) => org.userCount },
          {
            header: 'Created',
            className: 'text-muted-foreground',
            cell: (org) => org.createdAt,
          },
          {
            header: 'Status',
            cell: (org) => <StatusPill active={org.status === 'active'} />,
          },
        ]}
        renderCard={(org) => (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/superadmin/organizations/${org.id}`}
                className="font-medium hover:underline"
              >
                {org.name}
              </Link>
              <div className="text-xs text-muted-foreground">{org.slug}</div>
              <div className="mt-1 flex items-center gap-x-3 text-xs text-muted-foreground">
                <span>{org.userCount} users</span>
                <span>·</span>
                <span>{org.createdAt}</span>
              </div>
            </div>
            <StatusPill active={org.status === 'active'} />
          </div>
        )}
      />
    </div>
  );
}
