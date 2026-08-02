'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowRight, Building2, HardDrive, Users } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { currentTenant, updateCurrentTenant } from '@/lib/data/current-user';

const STORAGE_USED_GB = 3.4;
const STORAGE_TOTAL_GB = 10;

function initials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function TenantSettingsPage() {
  const [name, setName] = useState(currentTenant.name);
  const [logoUrl, setLogoUrl] = useState(currentTenant.logoUrl);

  function handleSave() {
    updateCurrentTenant({ name: name.trim(), logoUrl: logoUrl.trim() });
    toast.success('Organization settings saved');
  }

  const storagePct = Math.round((STORAGE_USED_GB / STORAGE_TOTAL_GB) * 100);

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Organization configuration for this tenant."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Building2 className="size-4.5" />
              </div>
              <div>
                <CardTitle>Organization</CardTitle>
                <CardDescription>
                  Name, branding, and theme for {name || 'this tenant'}.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                <AvatarImage src={logoUrl || undefined} alt="" />
                <AvatarFallback>{initials(name || '?')}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Label htmlFor="org-logo">Logo URL</Label>
                <Input
                  id="org-logo"
                  placeholder="https://..."
                  value={logoUrl}
                  className="mt-1.5"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setLogoUrl(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" defaultValue={currentTenant.slug} disabled />
            </div>

            <Button className="self-start" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Users className="size-4.5" />
                </div>
                <div>
                  <p className="font-medium">Users</p>
                  <p className="text-sm text-muted-foreground">
                    Manage tenant users and their status.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                nativeButton={false}
                render={
                  <Link href="/tenant-admin/users" aria-label="Go to Users" />
                }
              >
                <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <HardDrive className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Storage</CardTitle>
                  <CardDescription>
                    Usage summary for attachments and generated documents.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Progress value={storagePct} />
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-muted-foreground">
                  {STORAGE_USED_GB} GB of {STORAGE_TOTAL_GB} GB used
                </p>
                <p className="text-sm font-medium">{storagePct}%</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
