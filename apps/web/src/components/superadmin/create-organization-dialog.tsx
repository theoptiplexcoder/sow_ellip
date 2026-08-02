'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from '@sow-platform/ui';
import {
  createOrganization,
  type Organization,
} from '@/lib/data/organizations';

export function CreateOrganizationDialog({
  onCreated,
}: {
  onCreated: (organization: Organization) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const slug = String(formData.get('slug') ?? '').trim();
    const tenantAdminName = String(formData.get('adminName') ?? '').trim();
    const tenantAdminEmail = String(formData.get('adminEmail') ?? '').trim();
    if (!name || !slug || !tenantAdminName || !tenantAdminEmail) return;

    const organization = createOrganization({
      name,
      slug,
      tenantAdminName,
      tenantAdminEmail,
    });
    onCreated(organization);
    toast.success('Organization created (prototype only — not persisted)');
    setOpen(false);
    e.currentTarget.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New Organization
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Organization</DialogTitle>
          <DialogDescription>
            Creates a tenant and seeds one Tenant Admin. The Tenant Admin
            receives credentials through the existing invite flow — no separate
            notification is sent.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                name="name"
                placeholder="Acme Consulting"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                name="slug"
                placeholder="acme-consulting"
                required
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">Tenant Admin name</Label>
              <Input
                id="admin-name"
                name="adminName"
                placeholder="Jamie Chen"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Tenant Admin email</Label>
              <Input
                id="admin-email"
                name="adminEmail"
                type="email"
                placeholder="jamie@acme.com"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create Organization</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
