'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { DASHBOARD_ROLES, type DashboardRole, type NavConfig } from '../../../components/admin/nav-config';
import { PARTICIPANT_NAV_CONFIG } from '../../../components/participant/nav-config';
import { CLIENT_NAV_CONFIG } from '../../../components/client/nav-config';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

const NAV_CONFIG_BY_ROLE: Record<DashboardRole, NavConfig> = {
  admin: DASHBOARD_ROLES.admin,
  participant: PARTICIPANT_NAV_CONFIG,
  client: CLIENT_NAV_CONFIG,
  approver: DASHBOARD_ROLES.approver,
  viewer: DASHBOARD_ROLES.viewer,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const segments = pathname.split('/').filter(Boolean);
  const roleSegment = segments[1];
  const role: DashboardRole =
    roleSegment && roleSegment in NAV_CONFIG_BY_ROLE ? (roleSegment as DashboardRole) : 'admin';
  const { label, nav } = NAV_CONFIG_BY_ROLE[role];
  const userInitials = 'AY';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar
        roleLabel={label}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onToggleMobile={() => setMobileOpen((o) => !o)}
        userInitials={userInitials}
      />
      <div className="flex flex-1 relative">
        <Sidebar
          nav={nav}
          basePath="/tenantSlug"
          pathname={pathname}
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          roleLabel={label}
          userInitials={userInitials}
        />
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
