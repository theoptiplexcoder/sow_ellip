import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { NavItem } from '../../../components/admin/nav-config';

export function Sidebar({
  nav,
  basePath,
  pathname,
  collapsed,
  mobileOpen,
  onCloseMobile,
  roleLabel,
  userInitials,
}: {
  nav: NavItem[];
  basePath: string;
  pathname: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  roleLabel: string;
  userInitials: string;
}) {
  const searchParams = useSearchParams();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-50 flex w-60 shrink-0 flex-col border-r border-border bg-muted/40 transition-transform duration-200 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:z-auto md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((item) => {
            const href = `${basePath}${item.href}`;
            const active = pathname === href;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            // Automatically expand if active or if any sub-item is active
            const isExpanded = active || (item.subItems && item.subItems.some(sub => `${basePath}${sub.href.split('?')[0]}` === pathname));

            return (
              <div key={item.href} className="flex flex-col">
                <Link
                  href={href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active || isExpanded
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  } ${collapsed ? 'md:justify-center' : ''}`}
                >
                  {active && (
                    <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  <span className={collapsed ? 'md:hidden flex-1 text-left' : 'flex-1 text-left'}>{item.label}</span>
                  {hasSubItems && !collapsed && (
                    <span className="ml-auto flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </span>
                  )}
                </Link>
                {hasSubItems && isExpanded && !collapsed && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-9 pr-2">
                    {item.subItems!.map((subItem) => {
                      const [subPath, subQuery] = subItem.href.split('?');
                      const subHref = `${basePath}${subItem.href}`;
                      const subActive = 
                        pathname === `${basePath}${subPath}` &&
                        (!subQuery || searchParams.toString().includes(subQuery));

                      return (
                        <Link
                          key={subItem.href}
                          href={subHref}
                          onClick={onCloseMobile}
                          className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                            subActive
                              ? 'bg-accent text-accent-foreground'
                              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex items-center gap-2.5 border-t border-border p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {userInitials}
          </span>
          <span className={`truncate text-sm text-muted-foreground ${collapsed ? 'md:hidden' : ''}`}>
            {roleLabel}
          </span>
        </div>
      </aside>
    </>
  );
}
