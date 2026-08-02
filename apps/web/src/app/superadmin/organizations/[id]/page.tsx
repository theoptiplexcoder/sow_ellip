import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Mail, Users } from 'lucide-react';
import { Avatar, AvatarFallback, Card, CardContent } from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatusPill } from '@/components/shared/status-badge';
import { Surface } from '@/components/shared/surface';
import { OrganizationStatusAction } from '@/components/superadmin/organization-status-action';
import { getOrganization } from '@/lib/data/organizations';

function orgInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const org = getOrganization(id);
  if (!org) notFound();

  return (
    <div>
      <Link
        href="/superadmin/organizations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to Organizations
      </Link>
      <PageHeader
        title={org.name}
        description={`/${org.slug}`}
        actions={<OrganizationStatusAction organization={org} />}
      />

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 shrink-0">
              <AvatarFallback className="text-lg">
                {orgInitials(org.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-semibold tracking-tight">
                  {org.name}
                </span>
                <StatusPill active={org.status === 'active'} />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  {org.tenantAdminName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {org.tenantAdminEmail}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Created {org.createdAt}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-6 border-t pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
            <div>
              <div className="font-display text-2xl font-semibold tracking-tight tabular-nums">
                {org.userCount}
              </div>
              <div className="text-xs text-muted-foreground">Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Surface
        className="mt-8 bg-muted/30"
        contentClassName="p-4 text-sm text-muted-foreground"
      >
        No SOW, template, or workflow content is visible here — Superadmin scope
        stops at tenant existence.
      </Surface>
    </div>
  );
}
