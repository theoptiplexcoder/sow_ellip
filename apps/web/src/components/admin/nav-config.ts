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
          { label: 'Published', href: '/admin/sows?status=PUBLISHED' },
          { label: 'Draft', href: '/admin/sows?status=DRAFT' },
        ],
      },
      {
        label: 'Workflows',
        href: '/admin/workflows',
        icon: GitPullRequest,
        subItems: [
          { label: 'Published', href: '/admin/workflows?status=PUBLISHED' },
          { label: 'Draft', href: '/admin/workflowyard?status=DRAFT' },
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
