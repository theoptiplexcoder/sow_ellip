import Link from 'next/link';
import { Building2, CircleCheck, CirclePause, Users } from 'lucide-react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { StatusPill } from '@/components/shared/status-badge';
import { organizations } from '@/lib/data/organizations';

export default function SuperadminDashboard() {
  const totalTenants = organizations.length;
  const activeTenants = organizations.filter(
    (o) => o.status === 'active',
  ).length;
  const disabledTenants = organizations.filter(
    (o) => o.status === 'disabled',
  ).length;
  const totalUsers = organizations.reduce((sum, o) => sum + o.userCount, 0);

  return (
    <div>
      <PageHeader
        title="Platform Dashboard"
        description="Tenant-wide metrics across the SOW Platform."
        actions={
          <Button render={<Link href="/superadmin/organizations" />}>
            Manage Organizations
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tenants" value={totalTenants} icon={Building2} />
        <StatCard
          label="Active Tenants"
          value={activeTenants}
          icon={CircleCheck}
        />
        <StatCard
          label="Disabled Tenants"
          value={disabledTenants}
          icon={CirclePause}
        />
        <StatCard label="Total Users" value={totalUsers} icon={Users} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Organizations
        </h2>
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/superadmin/organizations/${org.id}`}
                      className="hover:underline"
                    >
                      {org.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {org.slug}
                  </TableCell>
                  <TableCell>{org.tenantAdminName}</TableCell>
                  <TableCell>{org.userCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {org.createdAt}
                  </TableCell>
                  <TableCell>
                    <StatusPill active={org.status === 'active'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
