'use client';

import {
  Activity,
  CheckSquare,
  FileStack,
  FolderKanban,
  LayoutDashboard,
} from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { WorkflowsSidebarSection } from '@/components/participant/workflows-sidebar-section';
import { currentUsers } from '@/lib/data/current-user';

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/participant', icon: LayoutDashboard },
  { label: 'Projects', href: '/participant/projects', icon: FolderKanban },
  { label: 'My SOWs', href: '/participant/my-sows', icon: FileStack },
  { label: 'Approvals', href: '/participant/approvals', icon: CheckSquare },
  { label: 'Activity', href: '/participant/activity', icon: Activity },
];

export default function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      role="participant"
      personaLabel="Participant"
      navItems={navItems}
      sidebarExtra={<WorkflowsSidebarSection />}
      user={currentUsers.participant}
    >
      {children}
    </AppShell>
  );
}
