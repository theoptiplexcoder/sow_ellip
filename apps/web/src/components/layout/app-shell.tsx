'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type LucideIcon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  cn,
} from '@sow-platform/ui';

export type PersonaRole =
  | 'superadmin'
  | 'tenant_admin'
  | 'participant'
  | 'client';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AppShellProps {
  role: PersonaRole;
  personaLabel: string;
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  /** Extra content rendered in the sidebar below the primary nav (e.g. a role-specific section). */
  sidebarExtra?: React.ReactNode;
  user: { name: string; email: string; initials: string };
  children: React.ReactNode;
}

const MOBILE_TAB_COUNT = 4;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  items,
  pathname,
  onNavigate,
  isCollapsed,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              'group relative flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
                active
                  ? 'bg-white/15'
                  : 'bg-transparent group-hover:bg-sidebar-foreground/5',
              )}
            >
              <Icon
                className={cn(
                  'size-4',
                  active
                    ? ''
                    : 'text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground',
                )}
              />
            </span>
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountRow({
  user,
  isCollapsed,
}: {
  user: AppShellProps['user'];
  isCollapsed?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center border-t border-sidebar-border py-3.5',
        isCollapsed ? 'justify-center px-0' : 'gap-3 px-4',
      )}
    >
      <Avatar className="size-9 border border-sidebar-border">
        <AvatarFallback className="bg-sidebar-primary/15 font-display text-sm font-semibold text-sidebar-primary">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      {!isCollapsed && (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name}
          </div>
          <div className="truncate text-xs text-sidebar-foreground/55">
            {user.email}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarBody({
  personaLabel,
  navItems,
  footerNavItems,
  sidebarExtra,
  user,
  pathname,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}: {
  personaLabel: string;
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  sidebarExtra?: React.ReactNode;
  user: AppShellProps['user'];
  pathname: string;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div
        className={cn(
          'flex items-center py-6',
          isCollapsed ? 'flex-col gap-4 px-2' : 'gap-2.5 px-4',
        )}
      >
        <div
          className={cn(
            'flex items-center',
            isCollapsed ? 'justify-center w-full' : 'w-full justify-between',
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground shadow-sm">
              S
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="font-display text-base leading-tight font-semibold tracking-tight">
                  SO<span className="text-sidebar-primary">Work</span>
                </div>
                <Badge
                  variant="outline"
                  className="mt-0.5 h-4.5 border-sidebar-border px-1.5 text-[10px] font-medium tracking-wide text-sidebar-foreground/55 uppercase"
                >
                  {personaLabel}
                </Badge>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          )}
        </div>
        {isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="text-sidebar-foreground/50 hover:text-sidebar-foreground mt-2"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavList
          items={navItems}
          pathname={pathname}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
        {!isCollapsed && sidebarExtra}
      </div>
      {footerNavItems && footerNavItems.length > 0 && (
        <div className="border-t border-sidebar-border px-3 py-3">
          <NavList
            items={footerNavItems}
            pathname={pathname}
            onNavigate={onNavigate}
            isCollapsed={isCollapsed}
          />
        </div>
      )}
      <AccountRow user={user} isCollapsed={isCollapsed} />
    </div>
  );
}

function MobileTabBar({
  primaryItems,
  overflowItems,
  pathname,
  onMoreOpen,
  moreActive,
}: {
  primaryItems: NavItem[];
  overflowItems: NavItem[];
  pathname: string;
  onMoreOpen: () => void;
  moreActive: boolean;
}) {
  const hasMore = overflowItems.length > 0;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sidebar-border bg-sidebar/95 backdrop-blur md:hidden">
      <div className="flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {primaryItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium"
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-full transition-colors',
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/55',
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <span
                className={cn(
                  'truncate px-1',
                  active
                    ? 'text-sidebar-foreground'
                    : 'text-sidebar-foreground/55',
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        {hasMore && (
          <button
            type="button"
            onClick={onMoreOpen}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium"
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full transition-colors',
                moreActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/55',
              )}
            >
              <MoreHorizontal className="size-[18px]" />
            </span>
            <span
              className={cn(
                'truncate px-1',
                moreActive
                  ? 'text-sidebar-foreground'
                  : 'text-sidebar-foreground/55',
              )}
            >
              More
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}

export function AppShell({
  role,
  personaLabel,
  navItems,
  footerNavItems,
  sidebarExtra,
  user,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const primaryItems = navItems.slice(0, MOBILE_TAB_COUNT);
  const overflowNavItems = navItems.slice(MOBILE_TAB_COUNT);
  const moreItems = [...overflowNavItems, ...(footerNavItems ?? [])];
  const moreActive = moreItems.some((item) => isActive(pathname, item.href));

  return (
    <div data-role={role} className="flex min-h-screen w-full bg-muted/40">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-sidebar-border md:block transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-72',
        )}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <SidebarBody
            personaLabel={personaLabel}
            navItems={navItems}
            footerNavItems={footerNavItems}
            sidebarExtra={sidebarExtra}
            user={user}
            pathname={pathname}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary font-display text-xs font-bold text-primary-foreground">
              S
            </div>
            <div className="flex items-baseline gap-1.5 font-display text-sm font-semibold tracking-tight">
              SO<span className="text-primary">Work</span>
            </div>
          </div>
          <Avatar className="size-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </header>

        <main className="min-w-0 flex-1 p-4 pb-24 md:p-7 md:pb-8 xl:p-10">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>

      <MobileTabBar
        primaryItems={primaryItems}
        overflowItems={moreItems}
        pathname={pathname}
        onMoreOpen={() => setMoreOpen(true)}
        moreActive={moreActive}
      />

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] p-0 md:hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>More navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col">
            <div className="px-4 pt-5 pb-1">
              <div className="font-display text-base font-semibold tracking-tight">
                SO<span className="text-primary">Work</span>
              </div>
              <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {personaLabel}
              </div>
            </div>
            <div className="px-3 py-2">
              <NavList
                items={moreItems}
                pathname={pathname}
                onNavigate={() => setMoreOpen(false)}
              />
              {sidebarExtra}
            </div>
            <AccountRow user={user} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
