export type OrganizationStatus = 'active' | 'disabled';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tenantAdminName: string;
  tenantAdminEmail: string;
  userCount: number;
  createdAt: string;
  status: OrganizationStatus;
}

export const organizations: Organization[] = [
  {
    id: 'org-1',
    name: 'Northwind Consulting',
    slug: 'northwind-consulting',
    tenantAdminName: 'Dana Whitfield',
    tenantAdminEmail: 'dana@northwind.io',
    userCount: 24,
    createdAt: '2025-11-03',
    status: 'active',
  },
  {
    id: 'org-2',
    name: 'Beacon Digital Studio',
    slug: 'beacon-digital',
    tenantAdminName: 'Marcus Lee',
    tenantAdminEmail: 'marcus@beacondigital.com',
    userCount: 11,
    createdAt: '2025-12-14',
    status: 'active',
  },
  {
    id: 'org-3',
    name: 'Redwood Systems Group',
    slug: 'redwood-systems',
    tenantAdminName: 'Priya Nair',
    tenantAdminEmail: 'priya@redwoodsg.com',
    userCount: 37,
    createdAt: '2026-01-09',
    status: 'active',
  },
  {
    id: 'org-4',
    name: 'Solstice Media Partners',
    slug: 'solstice-media',
    tenantAdminName: 'Owen Barrett',
    tenantAdminEmail: 'owen@solsticemp.com',
    userCount: 6,
    createdAt: '2026-02-20',
    status: 'disabled',
  },
  {
    id: 'org-5',
    name: 'Ironclad Advisory',
    slug: 'ironclad-advisory',
    tenantAdminName: 'Sasha Romero',
    tenantAdminEmail: 'sasha@ironcladadv.com',
    userCount: 15,
    createdAt: '2026-03-27',
    status: 'active',
  },
  {
    id: 'org-6',
    name: 'Vantage Point Labs',
    slug: 'vantage-point-labs',
    tenantAdminName: 'Felix Ngo',
    tenantAdminEmail: 'felix@vantagepoint.dev',
    userCount: 4,
    createdAt: '2026-05-11',
    status: 'disabled',
  },
];

export function getOrganization(id: string) {
  return organizations.find((o) => o.id === id);
}

export const organizationGrowth = [
  { month: 'Feb', organizations: 1 },
  { month: 'Mar', organizations: 2 },
  { month: 'Apr', organizations: 2 },
  { month: 'May', organizations: 3 },
  { month: 'Jun', organizations: 4 },
  { month: 'Jul', organizations: 5 },
  { month: 'Aug', organizations: 6 },
];

export const platformAuditEvents = [
  {
    id: 'pa-1',
    event: 'Organization Created',
    detail: 'Ironclad Advisory',
    actor: 'Superadmin',
    timestamp: '2026-03-27 09:14',
  },
  {
    id: 'pa-2',
    event: 'Tenant Admin Assigned',
    detail: 'Sasha Romero → Ironclad Advisory',
    actor: 'Superadmin',
    timestamp: '2026-03-27 09:15',
  },
  {
    id: 'pa-3',
    event: 'Organization Disabled',
    detail: 'Vantage Point Labs',
    actor: 'Superadmin',
    timestamp: '2026-05-18 16:02',
  },
  {
    id: 'pa-4',
    event: 'Superadmin Login',
    detail: 'yashwanth@sow-platform.com',
    actor: 'Superadmin',
    timestamp: '2026-07-30 08:41',
  },
  {
    id: 'pa-5',
    event: 'Organization Enabled',
    detail: 'Beacon Digital Studio',
    actor: 'Superadmin',
    timestamp: '2025-12-14 11:00',
  },
  {
    id: 'pa-6',
    event: 'Organization Created',
    detail: 'Vantage Point Labs',
    actor: 'Superadmin',
    timestamp: '2026-05-11 13:22',
  },
];
