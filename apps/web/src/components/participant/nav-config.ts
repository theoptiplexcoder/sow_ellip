import {
  FileText,
  FolderKanban,
  GitPullRequest,
  History,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import type { NavConfig } from '../admin/nav-config';

export const PARTICIPANT_NAV_CONFIG: NavConfig = {
  label: 'SOW Participant',
  nav: [
    { label: 'Dashboard', href: '/participant', icon: LayoutDashboard },
    { label: 'Clients', href: '/participant/clients', icon: Users },
    { label: 'Projects', href: '/participant/projects', icon: FolderKanban },
    {
      label: 'SOWs',
      href: '/participant/sows',
      icon: FileText,
      subItems: [
          { label: 'All', href: '/participant/sows?status=ALL' },
          { label: 'In review', href: '/participant/sows?status=IN_REVIEW' },
          { label: 'Changes requested', href: '/participant/sows?status=CHANGES_REQUESTED' },
          { label: 'Rejected', href: '/participant/sows?status=REJECTED' },
          { label: 'Approval', href: '/participant/sows?status=APPROVED' },
          { label: 'Draft', href: '/participant/sows?status=DRAFT' },
      ],
    },
    {
      label: 'Workflows',
      href: '/participant/workflows',
      icon: GitPullRequest,
      subItems: [
        { label: 'Workflow Yard', href: '/participant/workflows/yard' },
      ],
    },
    { label: 'Audit Log', href: '/participant/auditlogs', icon: History },
  ],
};
