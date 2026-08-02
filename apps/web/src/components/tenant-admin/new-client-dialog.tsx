'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
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
import { createClient, type Client } from '@/lib/data/clients';

export function NewClientDialog({
  onCreated,
}: {
  onCreated: (client: Client) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const company = String(formData.get('company') ?? '').trim();
    const owner = String(formData.get('owner') ?? '').trim();
    if (!company || !owner) return;

    const client = createClient({ company, owner });
    onCreated(client);
    toast.success('Client created (prototype only — not persisted)');
    setOpen(false);
    e.currentTarget.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New Client
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>
            Add a client to manage projects and SOWs under.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-company">Company name</Label>
            <Input
              id="client-company"
              name="company"
              placeholder="Acme Corporation"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="client-owner">Owner</Label>
            <Input
              id="client-owner"
              name="owner"
              placeholder="Account owner name"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
