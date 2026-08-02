'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sow-platform/ui';
import { clients } from '@/lib/data/clients';
import { createProject } from '@/lib/data/projects';
import { currentUsers } from '@/lib/data/current-user';

export function NewProjectDialog() {
  const router = useRouter();
  const me = currentUsers.participant;
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const client = clients.find((c) => c.id === clientId);
    if (!name || !client) return;

    const project = createProject({
      name,
      clientId: client.id,
      clientName: client.company,
      ownerId: me.id,
      ownerName: me.name,
    });

    toast.success('Project created (prototype only — not persisted)');
    setOpen(false);
    router.push(`/participant/projects/${project.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New Project
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>
            You&apos;ll be added as the project&apos;s creator.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              name="name"
              placeholder="Storefront Modernization Phase 3"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="project-client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!clientId}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
