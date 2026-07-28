import {
  FileText,
  FolderKanban,
  GitPullRequest,
  History,
  LayoutDashboard,
  type LucideIcon,
  Users,
} from 'lucide-react';

export type DashboardRole = 'admin' | 'participant' | 'client' | 'approver' | 'viewer';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  subItems?: { label: string; href: string }[];
};

export type NavConfig = {
  label: string;
  nav: NavItem[];
};

export const DASHBOARD_ROLES: Record<
  Exclude<DashboardRole, 'participant' | 'client'>,
  NavConfig
> = {
  admin: {
    label: 'Organization Admin',
    nav: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Team', href: '/admin/team', icon: Users },
      { label: 'Clients', href: '/admin/clients', icon: Users },
      { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
      {
        label: 'SOWs',
        href: '/admin/sows',
        icon: FileText,
        subItems: [
          { label: 'All', href: '/admin/sows?status=ALL' },
          { label: 'In review', href: '/admin/sows?status=IN_REVIEW' },
          { label: 'Changes requested', href: '/admin/sows?status=CHANGES_REQUESTED' },
          { label: 'Rejected', href: '/admin/sows?status=REJECTED' },
          { label: 'Approval', href: '/admin/sows?status=APPROVED' },
          { label: 'Draft', href: '/admin/sows?status=DRAFT' },
        ],
      },
      {
        label: 'Workflows',
        href: '/admin/workflows',
        icon: GitPullRequest,
        subItems: [
          { label: 'Active Workflows', href: '/admin/workflows' },
          { label: 'Workflow Yard', href: '/admin/workflowyard' },
        ],
      },
      { label: 'Audit Log', href: '/admin/auditlogs', icon: History },
    ],
  },
  approver: {
    label: 'Approver',
    nav: [
      { label: 'Dashboard', href: '/approver', icon: LayoutDashboard },
    ],
  },
  viewer: {
    label: 'Executive Viewer',
    nav: [
      { label: 'Dashboard', href: '/viewer', icon: LayoutDashboard },
      { label: 'Audit Log', href: '/auditlogs', icon: History },
    ],
  },
};
