'use client';

import {
  Building2,
  FileStack,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  Workflow,
} from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { currentUsers } from '@/lib/data/current-user';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/tenant-admin', icon: LayoutDashboard },
  { label: 'Clients', href: '/tenant-admin/clients', icon: Building2 },
  { label: 'Projects', href: '/tenant-admin/projects', icon: FolderKanban },
  { label: 'Templates', href: '/tenant-admin/templates', icon: FileText },
  {
    label: 'Workflow Templates',
    href: '/tenant-admin/workflow-templates',
    icon: Workflow,
  },
  { label: 'SOWs', href: '/tenant-admin/sows', icon: FileStack },
  { label: 'Users', href: '/tenant-admin/users', icon: Users },
  { label: 'Audit', href: '/tenant-admin/audit', icon: ScrollText },
  { label: 'Settings', href: '/tenant-admin/settings', icon: Settings },
];

const footerNavItems: NavItem[] = [
  { label: 'Organization', href: '/tenant-admin/settings', icon: Building2 },
  { label: 'Profile', href: '/tenant-admin/settings', icon: Users },
];

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      role="tenant_admin"
      personaLabel="Tenant Admin"
      navItems={navItems}
      footerNavItems={footerNavItems}
      user={currentUsers.tenant_admin}
    >
      {children}
    </AppShell>
  );
}
