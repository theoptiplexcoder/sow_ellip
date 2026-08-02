'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { currentTenant } from '@/lib/data/current-user';

export default function TenantSettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Organization configuration for this tenant."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Name, branding, and theme for {currentTenant.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input id="org-name" defaultValue={currentTenant.name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" defaultValue={currentTenant.slug} disabled />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-logo">Logo URL</Label>
              <Input id="org-logo" placeholder="https://..." />
            </div>
            <Button
              className="self-start"
              onClick={() => toast.success('Organization settings saved')}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage tenant users and their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/tenant-admin/users" />}
            >
              Go to Users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
            <CardDescription>
              Usage summary for attachments and generated documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Progress value={34} />
            <p className="text-sm text-muted-foreground">
              3.4 GB of 10 GB used
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
