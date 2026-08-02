'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, Badge, Button } from '@sow-platform/ui';
import { addAuditLog } from '@/lib/data/audit-logs';
import {
  getClientAccessForProject,
  grantClientAccess,
  revokeClientAccess,
} from '@/lib/data/client-access';
import { getClient } from '@/lib/data/clients';
import type { Project } from '@/lib/data/projects';

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ClientAccessPanel({ project }: { project: Project }) {
  const router = useRouter();
  const client = getClient(project.clientId);
  const access = getClientAccessForProject(project.id);

  function toggle(contact: { id: string; name: string; email: string }) {
    const existing = access.find((a) => a.clientContactId === contact.id);
    if (existing) {
      revokeClientAccess(existing.id);
      addAuditLog({
        actor: 'Dana Whitfield',
        entityType: 'Project',
        entityName: project.name,
        action: 'client-project access revoked',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        metadata: { contact: contact.name },
      });
      toast.success(`Revoked access for ${contact.name}`);
    } else {
      grantClientAccess(project.id, contact);
      addAuditLog({
        actor: 'Dana Whitfield',
        entityType: 'Project',
        entityName: project.name,
        action: 'client-project access granted',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        metadata: { contact: contact.name },
      });
      toast.success(`Granted access to ${contact.name}`);
    }
    router.refresh();
  }

  if (!client) {
    return (
      <p className="text-sm text-muted-foreground">
        No client record found for this project.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Grant {client.company} contacts view &amp; comment access to this
        project&apos;s SOWs once they leave Draft.
      </p>
      {client.contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No contacts on file for {client.company}.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {client.contacts.map((contact) => {
            const granted = access.some(
              (a) => a.clientContactId === contact.id,
            );
            return (
              <li
                key={contact.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {contact.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {contact.email} · {contact.title}
                  </div>
                </div>
                {granted && (
                  <Badge variant="outline" className="ml-auto">
                    Access granted
                  </Badge>
                )}
                <Button
                  variant={granted ? 'outline' : 'default'}
                  size="sm"
                  className={granted ? '' : 'ml-auto'}
                  onClick={() => toggle(contact)}
                >
                  {granted ? 'Revoke access' : 'Grant access'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
