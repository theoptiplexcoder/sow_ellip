// Mock KPI data, shaped like the aggregated response a future
// GET /api/admin/dashboard-kpis endpoint would return: org-wide (not just
// "mine"), but always scoped to the caller's organizationId — same as every
// other Prisma query and RLS policy in this codebase. Never a cross-org
// aggregate. Replace each constant below with the corresponding fetch once
// the backend is approved and implemented.

export type SowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'APPROVED';

export const SOW_STATUS_COUNTS: { status: SowStatus; count: number }[] = [
  { status: 'DRAFT', count: 14 },
  { status: 'SUBMITTED', count: 6 },
  { status: 'IN_REVIEW', count: 5 },
  { status: 'CHANGES_REQUESTED', count: 4 },
  { status: 'REJECTED', count: 2 },
  { status: 'APPROVED', count: 31 },
];

export const AVG_STATUS_DURATION: { transition: string; avgDays: number }[] = [
  { transition: 'Draft → Submitted', avgDays: 3.2 },
  { transition: 'Submitted → In Review', avgDays: 1.4 },
  { transition: 'In Review → Approved', avgDays: 4.8 },
];

export const STUCK_IN_CHANGES_REQUESTED: {
  id: string;
  sowNumber: string;
  title: string;
  daysInStatus: number;
}[] = [
  { id: 's-1', sowNumber: 'SOW-2026-0031', title: 'Data migration phase 2', daysInStatus: 11 },
  { id: 's-2', sowNumber: 'SOW-2026-0028', title: 'Support retainer renewal', daysInStatus: 8 },
  { id: 's-3', sowNumber: 'SOW-2026-0019', title: 'Mobile app audit', daysInStatus: 6 },
  { id: 's-4', sowNumber: 'SOW-2026-0044', title: 'API integration', daysInStatus: 3 },
];

export const APPROVER_PENDING: { approver: string; pending: number }[] = [
  { approver: 'Dana Wu', pending: 5 },
  { approver: 'Priya Nair', pending: 3 },
  { approver: 'Sam Okafor', pending: 2 },
  { approver: 'Alex Chen', pending: 1 },
];

export const WORKFLOW_TURNAROUND: { workflow: string; avgDays: number }[] = [
  { workflow: 'Standard 2-step', avgDays: 3.5 },
  { workflow: 'High-value 3-step', avgDays: 6.1 },
  { workflow: 'Fast-track 1-step', avgDays: 1.2 },
];

export const WORKFLOW_REJECTION_RATE: { workflow: string; rejectionRatePct: number }[] = [
  { workflow: 'Standard 2-step', rejectionRatePct: 8 },
  { workflow: 'High-value 3-step', rejectionRatePct: 22 },
  { workflow: 'Fast-track 1-step', rejectionRatePct: 3 },
];

export type Role = 'ADMIN' | 'CREATOR' | 'APPROVER' | 'VIEWER';

export const ROLE_ACTIVITY: { role: Role; active: number; inactive: number }[] = [
  { role: 'ADMIN', active: 2, inactive: 0 },
  { role: 'CREATOR', active: 6, inactive: 2 },
  { role: 'APPROVER', active: 4, inactive: 1 },
  { role: 'VIEWER', active: 3, inactive: 3 },
];

export const INACTIVE_USERS: {
  name: string;
  email: string;
  role: Role;
  lastActiveDaysAgo: number;
}[] = [
  { name: 'Jordan Lee', email: 'jordan@acme.com', role: 'APPROVER', lastActiveDaysAgo: 92 },
  { name: 'Alex Chen', email: 'alex@acme.com', role: 'VIEWER', lastActiveDaysAgo: 61 },
  { name: 'Morgan Diaz', email: 'morgan@acme.com', role: 'CREATOR', lastActiveDaysAgo: 45 },
  { name: 'Riley Park', email: 'riley@acme.com', role: 'VIEWER', lastActiveDaysAgo: 33 },
];

export const TEMPLATE_USAGE: { template: string; sowCount: number }[] = [
  { template: 'Retainer v2', sowCount: 18 },
  { template: 'Fixed-bid Project', sowCount: 12 },
  { template: 'Time & Materials', sowCount: 9 },
  { template: 'Discovery Sprint', sowCount: 4 },
  { template: 'Retainer v1', sowCount: 1 },
];

export const IDLE_WORKFLOWS: { workflow: string; activeSows: number }[] = [
  { workflow: 'Legacy 4-step', activeSows: 0 },
  { workflow: 'Pilot review', activeSows: 0 },
];

export const CLIENT_PROJECT_COUNTS: { client: string; activeProjects: number }[] = [
  { client: 'Initech', activeProjects: 5 },
  { client: 'Globex', activeProjects: 4 },
  { client: 'Umbrella Corp', activeProjects: 3 },
  { client: 'Soylent', activeProjects: 2 },
];

export const CLIENT_SOW_VALUE: { client: string; totalValue: number }[] = [
  { client: 'Initech', totalValue: 284000 },
  { client: 'Globex', totalValue: 197500 },
  { client: 'Umbrella Corp', totalValue: 152000 },
  { client: 'Soylent', totalValue: 68000 },
];

export const RECENT_AUDIT_ENTRIES: {
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}[] = [
  { actor: 'Priya Nair', action: 'USER_INVITED', entityType: 'USER', entityId: 'jordan@acme.com', createdAt: '2026-07-26 09:12' },
  { actor: 'Sam Okafor', action: 'WORKFLOW_ACTIVATED', entityType: 'WORKFLOW', entityId: 'Standard 2-step', createdAt: '2026-07-25 14:03' },
  { actor: 'Priya Nair', action: 'TEMPLATE_ARCHIVED', entityType: 'TEMPLATE', entityId: 'Retainer v1', createdAt: '2026-07-24 11:47' },
  { actor: 'Dana Wu', action: 'SOW_APPROVED', entityType: 'SOW', entityId: 'SOW-1042', createdAt: '2026-07-20 16:30' },
  { actor: 'Sam Okafor', action: 'CLIENT_CREATED', entityType: 'CLIENT', entityId: 'Initech', createdAt: '2026-07-11 08:55' },
  { actor: 'Priya Nair', action: 'PROJECT_UPDATED', entityType: 'PROJECT', entityId: 'Data migration', createdAt: '2026-07-10 10:20' },
];
