export const PERMISSIONS = [
  'client:create',
  'client:update',
  'project:create',
  'template:create',
  'workflow:create',
  'workflow:approve',
  'workflow:reject',
  'audit:view',
  'user:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Only three personas exist platform-wide (PRD §4). Creator/Approver/
// Executive Viewer are project-level roles held by a Participant, not
// personas of their own — see PROJECT_ROLES below.
export const PERSONAS = ['superadmin', 'tenant_admin', 'participant'] as const;

export type Persona = (typeof PERSONAS)[number];

// Per-project roles a Participant can hold (PRD §4.1). A Participant may
// hold different roles on different projects, or several roles on one
// project — resolved from ProjectRoleAssignment rows, never persona checks.
export const PROJECT_ROLES = [
  'creator',
  'approver',
  'executive_viewer',
] as const;

export type ProjectRole = (typeof PROJECT_ROLES)[number];

export function hasPermission(
  userPermissions: Permission[],
  required: Permission,
) {
  return userPermissions.includes(required);
}
