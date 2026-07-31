'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Pencil, Archive, FolderKanban, X } from 'lucide-react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableHead, TableBody, Th, Td, EmptyState } from '../ui/table';
import { Dialog, DialogTrigger, DialogContent } from '../ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ResizeHandle } from '../ui/resize-handle';
import { useResizableWidth } from '../../lib/useResizableWidth';

type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

type ClientProjectRow = {
  id: string;
  name: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
};

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On hold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const PROJECT_STATUS_TONE: Record<ProjectStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'neutral',
  CANCELLED: 'danger',
};

const PROJECTS_BY_CLIENT: Record<string, ClientProjectRow[]> = {
  'c-1': [
    { id: 'p-1', name: 'Website revamp', status: 'ACTIVE', startDate: '2026-02-01', endDate: '2026-06-30' },
    { id: 'p-2', name: 'Data migration', status: 'ON_HOLD', startDate: '2026-03-10' },
    { id: 'p-4', name: 'Mobile app redesign', status: 'COMPLETED', startDate: '2025-09-01', endDate: '2026-01-15' },
  ],
  'c-2': [{ id: 'p-3', name: 'Support retainer', status: 'ACTIVE', startDate: '2026-01-05' }],
  'c-3': [],
};

import { useClientStore, type ClientRow } from './clientStore';

const emptyForm = { name: '', companyName: '', primaryContact: '', email: '', phone: '' };

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
];

function avatarColor(id: string) {
  const index = id.charCodeAt(id.length - 1) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function ClientsPage() {
  const { clients, addClient, updateClient, archiveClient } = useClientStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(640, 280, 640);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      openCreate();
      router.replace(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const visible = clients.filter(
    (c) =>
      !c.archived &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        (c.primaryContact && c.primaryContact.toLowerCase().includes(search.toLowerCase()))),
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: ClientRow) {
    setEditing(client);
    setForm({
      name: client.name,
      companyName: client.companyName,
      primaryContact: client.primaryContact ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
    });
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.companyName.trim()) return;
    if (editing) {
      updateClient(editing.id, form);
    } else {
      addClient({
        id: `c-${Date.now()}`,
        ...form,
        projectsCount: 0,
        archived: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
    setOpen(false);
  }

  function archive(client: ClientRow) {
    if (client.projectsCount > 0) {
      setBlockedId(client.id);
      return;
    }
    archiveClient(client.id);
  }

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-6">
    <div className="min-w-0 flex-1">
      <PageHeader
        title="Clients"
        description="Organizations you deliver work for."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                New client
              </Button>
            </DialogTrigger>
            <DialogContent title={editing ? 'Edit client' : 'New client'}>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="client-name">Display name</Label>
                  <Input
                    id="client-name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client-company">Company name</Label>
                  <Input
                    id="client-company"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="client-contact">Primary contact</Label>
                  <Input
                    id="client-contact"
                    value={form.primaryContact}
                    onChange={(e) => setForm({ ...form, primaryContact: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? 'Save changes' : 'Create client'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {visible.length} client{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState message={search ? 'No clients match your search' : 'No clients yet'} />
      ) : (
        <Table>
          <TableHead>
            <Th>Client</Th>
            <Th>Contact</Th>
            <Th>Projects</Th>
            <Th>Added</Th>
            <Th className="w-10">&nbsp;</Th>
          </TableHead>
          <TableBody>
            {visible.map((client) => (
              <tr
                key={client.id}
                className="group cursor-pointer transition-colors hover:bg-muted/40"
                onClick={() => setSelectedClient(client)}
              >
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${avatarColor(client.id)}`}>
                      {getInitials(client.name)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{client.name}</div>
                      <div className="text-xs text-muted-foreground">{client.companyName}</div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div>{client.primaryContact ?? '—'}</div>
                  <div className="text-xs text-muted-foreground">{client.email}</div>
                </Td>
                <Td>
                  <Badge tone={client.projectsCount > 0 ? 'info' : 'neutral'}>{client.projectsCount}</Badge>
                </Td>
                <Td className="text-muted-foreground">{client.createdAt}</Td>
                <Td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        id={`client-actions-${client.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => openEdit(client)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => archive(client)}>
                        <Archive className="mr-2 h-3.5 w-3.5" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {blockedId === client.id && (
                    <p className="mt-1 text-xs text-red-600">
                      Can&apos;t archive — {client.projectsCount} linked project(s).
                    </p>
                  )}
                </Td>
              </tr>
            ))}
          </TableBody>
        </Table>
      )}
    </div>

    {selectedClient && (
      <aside
        className="fixed inset-0 z-40 overflow-y-auto bg-background p-4 md:sticky md:top-14 md:inset-auto md:z-auto md:h-[calc(100vh-3.5rem)] md:w-[var(--panel-w)] md:shrink-0 md:border-l md:border-border md:bg-muted/40 md:-mt-6 md:-mb-6 md:-mr-6"
        style={{ ['--panel-w' as any]: `${sidebarWidth}px` }}
      >
        <ResizeHandle onPointerDown={startResize} className="hidden md:block" />
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="text-base font-semibold text-foreground">{selectedClient.name}</div>
            <div className="mt-1 text-sm text-muted-foreground">Projects for {selectedClient.companyName}</div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelectedClient(null)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {(() => {
          const projects = PROJECTS_BY_CLIENT[selectedClient.id] ?? [];
          return projects.length === 0 ? (
            <EmptyState message="No projects for this client yet" />
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{project.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {project.startDate ?? '—'} → {project.endDate ?? '—'}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Badge tone={PROJECT_STATUS_TONE[project.status]}>{PROJECT_STATUS_LABEL[project.status]}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          );
        })()}
      </aside>
    )}
    </div>
  );
}
