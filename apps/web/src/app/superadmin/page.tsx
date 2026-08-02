import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CircleCheck,
  CirclePause,
  History,
  Layers,
  Users,
} from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  Button,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { SectionEyebrow } from '@/components/shared/section-eyebrow';
import { StatStrip } from '@/components/shared/stat-strip';
import { StatusPill } from '@/components/shared/status-badge';
import { organizations, platformAuditEvents } from '@/lib/data/organizations';

function orgInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function SuperadminDashboard() {
  const totalTenants = organizations.length;
  const activeTenants = organizations.filter(
    (o) => o.status === 'active',
  ).length;
  const disabledTenants = organizations.filter(
    (o) => o.status === 'disabled',
  ).length;
  const totalUsers = organizations.reduce((sum, o) => sum + o.userCount, 0);

  const recentOrgs = [...organizations]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 6);
  const recentActivity = platformAuditEvents.slice(0, 6);

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

      <StatStrip
        items={[
          { label: 'Total tenants', value: totalTenants, icon: Building2 },
          { label: 'Active tenants', value: activeTenants, icon: CircleCheck },
          {
            label: 'Disabled tenants',
            value: disabledTenants,
            icon: CirclePause,
          },
          { label: 'Total users', value: totalUsers, icon: Users },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionEyebrow
            icon={Layers}
            tint="var(--primary)"
            label="Organizations"
            description={`${totalTenants} tenant${totalTenants === 1 ? '' : 's'}, newest first`}
          />
          <div className="overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="max-w-0">
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
                          <div className="truncate font-medium">{org.name}</div>
                          <div className="truncate text-xs text-muted-foreground">
                            /{org.slug}
                          </div>
                        </div>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {org.userCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusPill active={org.status === 'active'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <SectionEyebrow
            icon={History}
            tint="var(--primary)"
            label="Recent platform activity"
            description="Latest platform-level events"
          />
          <ScrollArea className="h-72 pr-4">
            <ul className="relative flex flex-col gap-4 border-l border-border pl-6">
              {recentActivity.map((event) => (
                <li key={event.id} className="relative flex items-start gap-3">
                  <span className="absolute top-1 -left-[29px] size-2.5 rounded-full border-2 border-background bg-muted-foreground" />
                  <div className="text-sm">
                    <span className="font-medium">{event.event}</span>{' '}
                    <span className="text-muted-foreground">
                      — {event.detail}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {event.actor} · {event.timestamp}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </section>
      </div>
    </div>
  );
}
