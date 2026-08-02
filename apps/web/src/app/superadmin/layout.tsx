'use client';

import { Building2, LayoutDashboard, ScrollText } from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { currentUsers } from '@/lib/data/current-user';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
  {
    label: 'Organizations',
    href: '/superadmin/organizations',
    icon: Building2,
  },
  {
    label: 'Platform Analytics',
    href: '/superadmin/analytics',
    icon: LayoutDashboard,
  },
  { label: 'Audit Logs', href: '/superadmin/audit', icon: ScrollText },
];

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      role="superadmin"
      personaLabel="Super Admin"
      navItems={navItems}
      user={currentUsers.superadmin}
    >
      {children}
    </AppShell>
  );
}
