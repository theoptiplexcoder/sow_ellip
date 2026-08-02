import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, ShieldCheck, User, Users } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { StatusPill } from '@/components/shared/status-badge';
import { getOrganization } from '@/lib/data/organizations';

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
        actions={
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant={org.status === 'active' ? 'destructive' : 'default'}
                />
              }
            >
              {org.status === 'active' ? 'Disable' : 'Enable'} Organization
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {org.status === 'active' ? 'Disable' : 'Enable'} {org.name}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {org.status === 'active'
                    ? 'Tenant Admin and all Participants will immediately lose access to the platform.'
                    : 'This will restore platform access for this organization.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
        Tenant Summary
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tenant Admin
            </CardTitle>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <User className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="font-medium">{org.tenantAdminName}</div>
            <div className="text-sm text-muted-foreground">
              {org.tenantAdminEmail}
            </div>
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <ShieldCheck className="size-4" />
            </span>
          </CardHeader>
          <CardContent>
            <StatusPill active={org.status === 'active'} />
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users
            </CardTitle>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Users className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="font-display text-2xl font-semibold tracking-tight">
            {org.userCount}
          </CardContent>
        </Card>
        <Card className="gap-3">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Created
            </CardTitle>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Calendar className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="font-display text-2xl font-semibold tracking-tight">
            {org.createdAt}
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        No SOW, template, or workflow content is visible here — Superadmin scope
        stops at tenant existence.
      </p>
    </div>
  );
}
