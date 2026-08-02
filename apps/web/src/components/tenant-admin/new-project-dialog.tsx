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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@sow-platform/ui';
import { clients } from '@/lib/data/clients';
import { createProject, type Project } from '@/lib/data/projects';
import { users } from '@/lib/data/users';

export function NewProjectDialog({
  onCreated,
}: {
  onCreated: (project: Project) => void;
}) {
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [ownerId, setOwnerId] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = String(formData.get('name') ?? '').trim();
    const client = clients.find((c) => c.id === clientId);
    const owner = users.find((u) => u.id === ownerId);
    if (!name || !client || !owner) return;

    const project = createProject({
      name,
      clientId: client.id,
      clientName: client.company,
      ownerId: owner.id,
      ownerName: owner.name,
    });
    onCreated(project);
    toast.success('Project created (prototype only — not persisted)');
    setOpen(false);
    e.currentTarget.reset();
    setClientId('');
    setOwnerId('');
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
            Create a project under a client and assign an owner.
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
            <Select
              value={clientId}
              onValueChange={(value) => setClientId(value ?? '')}
            >
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-owner">Owner</Label>
            <Select
              value={ownerId}
              onValueChange={(value) => setOwnerId(value ?? '')}
            >
              <SelectTrigger id="project-owner">
                <SelectValue placeholder="Select an owner" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!clientId || !ownerId}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
