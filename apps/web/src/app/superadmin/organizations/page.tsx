'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
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

function orgInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function OrganizationsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'disabled'>('all');
  const [organizationList, setOrganizationList] =
    useState<Organization[]>(organizations);

  const filtered = useMemo(() => {
    return organizationList.filter((org) => {
      const matchesQuery =
        query.trim() === '' ||
        org.name.toLowerCase().includes(query.toLowerCase()) ||
        org.slug.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || org.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, organizationList]);

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Every tenant on the platform. Superadmin scope stops at tenant existence."
        actions={
          <CreateOrganizationDialog
            onCreated={() => setOrganizationList([...organizations])}
          />
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name or slug..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-background sm:max-w-xs"
          />
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="bg-background sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length} of {organizationList.length} organizations
        </span>
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
              <Link
                href={`/superadmin/organizations/${org.id}`}
                className="group flex items-center gap-2.5 hover:opacity-80"
              >
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {orgInitials(org.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate group-hover:underline">
                    {org.name}
                  </div>
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    /{org.slug}
                  </div>
                </div>
              </Link>
            ),
          },
          {
            header: 'Tenant Admin',
            className: 'text-muted-foreground',
            cell: (org) => org.tenantAdminName,
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
            <div className="flex min-w-0 items-start gap-2.5">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-xs">
                  {orgInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <Link
                  href={`/superadmin/organizations/${org.id}`}
                  className="font-medium hover:underline"
                >
                  {org.name}
                </Link>
                <div className="text-xs text-muted-foreground">/{org.slug}</div>
                <div className="mt-1 flex items-center gap-x-3 text-xs text-muted-foreground">
                  <span>{org.userCount} users</span>
                  <span>·</span>
                  <span>{org.createdAt}</span>
                </div>
              </div>
            </div>
            <StatusPill active={org.status === 'active'} />
          </div>
        )}
      />
    </div>
  );
}
