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

export function CreateOrganizationDialog() {
  const [open, setOpen] = useState(false);

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
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success(
              'Organization created (prototype only — not persisted)',
            );
            setOpen(false);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input id="org-name" placeholder="Acme Consulting" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" placeholder="acme-consulting" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name">Tenant Admin name</Label>
              <Input id="admin-name" placeholder="Jamie Chen" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email">Tenant Admin email</Label>
              <Input
                id="admin-email"
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
