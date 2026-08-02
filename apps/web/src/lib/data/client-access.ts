// Links a Client-persona contact to a Project (PRD §4.2). A fixed grant,
// not a variable role — unlike ProjectRoleAssignment there is no role field.

export interface ClientProjectAccess {
  id: string;
  projectId: string;
  clientContactId: string;
  clientContactName: string;
  clientContactEmail: string;
  grantedAt: string;
}

export const clientProjectAccess: ClientProjectAccess[] = [
  {
    id: 'cpa-1',
    projectId: 'proj-1',
    clientContactId: 'c1-1',
    clientContactName: 'Wendy Fischer',
    clientContactEmail: 'wendy@harborline.com',
    grantedAt: '2026-07-20',
  },
];

export function getClientAccessForProject(projectId: string) {
  return clientProjectAccess.filter((a) => a.projectId === projectId);
}

export function getProjectIdsForClientContact(clientContactId: string) {
  return clientProjectAccess
    .filter((a) => a.clientContactId === clientContactId)
    .map((a) => a.projectId);
}

export function grantClientAccess(
  projectId: string,
  contact: { id: string; name: string; email: string },
) {
  const access: ClientProjectAccess = {
    id: `cpa-${Date.now()}`,
    projectId,
    clientContactId: contact.id,
    clientContactName: contact.name,
    clientContactEmail: contact.email,
    grantedAt: new Date().toISOString().slice(0, 10),
  };
  clientProjectAccess.push(access);
  return access;
}

export function revokeClientAccess(id: string) {
  const idx = clientProjectAccess.findIndex((a) => a.id === id);
  if (idx !== -1) clientProjectAccess.splice(idx, 1);
}
