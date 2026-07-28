import { FileText, FolderKanban, LayoutDashboard } from 'lucide-react';
import type { NavConfig } from '../admin/nav-config';

export const CLIENT_NAV_CONFIG: NavConfig = {
  label: 'Client',
  nav: [
    { label: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { label: 'Projects', href: '/client/projects', icon: FolderKanban },
    {
      label: 'SOWs',
      href: '/client/sows',
      icon: FileText,
      subItems: [
        { label: 'All', href: '/client/sows?status=ALL' },
        { label: 'In review', href: '/client/sows?status=IN_REVIEW' },
        { label: 'Changes requested', href: '/client/sows?status=CHANGES_REQUESTED' },
        { label: 'Rejected', href: '/client/sows?status=REJECTED' },
        { label: 'Approved', href: '/client/sows?status=APPROVED' },
      ],
    },
  ],
};
