'use client';

import { useState } from 'react';
import { UserPlus, Search, MoreHorizontal, Trash2, FolderKanban, X } from 'lucide-react';
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

type Member = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  createdAt: string;
};

const CURRENT_USER_ID = 'u-1';

const INITIAL_MEMBERS: Member[] = [
  { id: 'u-1', employeeId: 'EMP-001', name: 'Priya Nair', email: 'priya@acme.com', designation: 'Admin', createdAt: '2026-01-12' },
  { id: 'u-2', employeeId: 'EMP-002', name: 'Sam Okafor', email: 'sam@acme.com', designation: 'Software Engineer', createdAt: '2026-02-03' },
  { id: 'u-3', employeeId: 'EMP-003', name: 'Dana Wu', email: 'dana@acme.com', designation: 'Product Manager', createdAt: '2026-02-18' },
  { id: 'u-4', employeeId: 'EMP-004', name: 'Jordan Lee', email: 'jordan@acme.com', designation: 'Designer', createdAt: '2026-03-05' },
  { id: 'u-5', employeeId: 'EMP-005', name: 'Alex Chen', email: 'alex@acme.com', designation: 'DevOps Engineer', createdAt: '2026-04-22' },
];

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

type SuccessfulProject = { id: string; name: string; client: string; completedAt: string };

const SUCCESSFUL_PROJECTS_BY_MEMBER: Record<string, SuccessfulProject[]> = {
  'u-1': [
    { id: 'p-4', name: 'Mobile app redesign', client: 'Northwind Traders', completedAt: '2026-01-15' },
    { id: 'p-5', name: 'Brand refresh', client: 'Globex', completedAt: '2025-11-02' },
  ],
  'u-2': [{ id: 'p-6', name: 'Legacy data cleanup', client: 'Northwind Traders', completedAt: '2025-12-20' }],
  'u-3': [],
  'u-4': [{ id: 'p-7', name: 'Design system rollout', client: 'Initech', completedAt: '2026-03-01' }],
  'u-5': [],
};

export function TeamPage() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Member | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDesignation, setInviteDesignation] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { width: sidebarWidth, startResize } = useResizableWidth(640, 280, 640);

  const visible = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.employeeId.toLowerCase().includes(search.toLowerCase()),
  );

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const nextNum = members.length + 1;
    const empId = `EMP-${nextNum < 10 ? '00' : nextNum < 100 ? '0' : ''}${nextNum}`;
    setMembers((prev) => [
      ...prev,
      {
        id: `u-${prev.length + 1}`,
        employeeId: empId,
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        designation: inviteDesignation.trim() || 'Employee',
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setInviteEmail('');
    setInviteDesignation('');
    setInviteOpen(false);
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setDeleting(null);
  }

  return (
    <div className="flex items-start gap-6">
    <div className="min-w-0 flex-1">
      <PageHeader
        title="Team"
        description="Manage the people in your organization."
        actions={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4" />
                Invite teammate
              </Button>
            </DialogTrigger>
            <DialogContent title="Invite teammate" description="They'll receive an email invite to join your organization.">
              <form className="space-y-4" onSubmit={handleInvite}>
                <div>
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="invite-designation">Designation</Label>
                  <Input
                    id="invite-designation"
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={inviteDesignation}
                    onChange={(e) => setInviteDesignation(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Send invite</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Dialog open={!!deleting} onOpenChange={(val) => !val && setDeleting(null)}>
        <DialogContent title="Remove member" className="max-w-md">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <span className="font-semibold text-foreground">{deleting?.name}</span> from the organization? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => deleting && removeMember(deleting.id)}>
              Remove member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {members.length} team member{members.length !== 1 ? 's' : ''}
        </span>
      </div>

      <Table>
        <TableHead>
          <Th>Employee ID</Th>
          <Th>Member</Th>
          <Th>Designation</Th>
          <Th>Joined</Th>
          <Th className="w-10">&nbsp;</Th>
        </TableHead>
        <TableBody>
          {visible.map((member) => {
            const isSelf = member.id === CURRENT_USER_ID;
            return (
              <tr
                key={member.id}
                className={`group cursor-pointer transition-colors hover:bg-muted/40 ${
                  selectedMember?.id === member.id ? 'bg-muted/40' : ''
                }`}
                onClick={() => setSelectedMember(member)}
              >
                <Td className="font-mono text-xs font-medium text-muted-foreground">
                  {member.employeeId}
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(member.id)}`}>
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {member.name}
                        {isSelf && (
                          <span className="ml-1.5 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            you
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                </Td>
                <Td className="text-muted-foreground">{member.designation}</Td>
                <Td className="text-muted-foreground">{member.createdAt}</Td>
                <Td>
                  {!isSelf && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          id={`team-actions-${member.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="text-red-600 hover:text-red-700" onClick={() => setDeleting(member)}>
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </Td>
              </tr>
            );
          })}
        </TableBody>
      </Table>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing members of your organization.
      </p>
    </div>

    {selectedMember && (
      <aside
        className="sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-l border-border bg-muted/40 p-4 -mt-6 -mb-6 -mr-6"
        style={{ width: sidebarWidth }}
      >
        <ResizeHandle onPointerDown={startResize} />
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(selectedMember.id)}`}>
              {getInitials(selectedMember.name)}
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{selectedMember.name}</div>
              <div className="text-sm text-muted-foreground">{selectedMember.designation}</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelectedMember(null)}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="mb-2 text-sm font-semibold text-foreground">Successful Projects</h3>
        {(() => {
          const projects = SUCCESSFUL_PROJECTS_BY_MEMBER[selectedMember.id] ?? [];
          return projects.length === 0 ? (
            <EmptyState message="No completed projects yet" />
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li key={project.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">{project.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{project.client}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge tone="success">Completed</Badge>
                    <div className="mt-1 text-xs text-muted-foreground">{project.completedAt}</div>
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
