export type Persona = 'superadmin' | 'tenant_admin' | 'participant';

export const currentTenant: { name: string; slug: string; logoUrl: string } = {
  name: 'Northwind Consulting',
  slug: 'northwind-consulting',
  logoUrl: '',
};

export function updateCurrentTenant(patch: { name: string; logoUrl: string }) {
  currentTenant.name = patch.name;
  currentTenant.logoUrl = patch.logoUrl;
}

export const currentUsers: Record<
  Persona,
  { id: string; name: string; email: string; initials: string }
> = {
  superadmin: {
    id: 'super-1',
    name: 'Alex Rivera',
    email: 'alex@sow-platform.com',
    initials: 'AR',
  },
  tenant_admin: {
    id: 'user-1',
    name: 'Dana Whitfield',
    email: 'dana@northwind.io',
    initials: 'DW',
  },
  participant: {
    id: 'user-6',
    name: 'Ravi Kapoor',
    email: 'ravi@northwind.io',
    initials: 'RK',
  },
};
