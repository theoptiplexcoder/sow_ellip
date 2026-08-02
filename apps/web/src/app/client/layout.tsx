'use client';

import { ScrollText } from 'lucide-react';
import { AppShell, type NavItem } from '@/components/layout/app-shell';
import { currentUsers } from '@/lib/data/current-user';

const navItems: NavItem[] = [
  { label: 'My SOWs', href: '/client', icon: ScrollText },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      role="client"
      personaLabel="Client"
      navItems={navItems}
      user={currentUsers.client}
    >
      {children}
    </AppShell>
  );
}
