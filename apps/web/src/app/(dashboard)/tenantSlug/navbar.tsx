'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon, Search, Settings, Plus, FileText, FolderKanban, GitPullRequest, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../../components/ui/dropdown-menu';

export function Navbar({
  roleLabel,
  collapsed,
  onToggleCollapse,
  onToggleMobile,
  userInitials,
}: {
  roleLabel: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobile: () => void;
  userInitials: string;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleMobile}
          className="press-scale rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="press-scale hidden rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <Link href="/" className="ml-1 flex items-center gap-2.5">
          <Image src="/logo.jpeg" alt="SOWwork" width={146} height={110} className="h-9 w-auto" priority />
        </Link>

        <span className="hidden text-sm text-muted-foreground md:inline">/ {roleLabel}</span>
      </div>

      {/* Center Group: Search Bar directly beside Create Button */}
      <div className="flex flex-1 items-center justify-center gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search SOWs, templates, clients..."
            className="w-full rounded-md border border-border bg-muted/50 py-1.5 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>New client</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FolderKanban className="mr-2 h-4 w-4" />
              <span>New project</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>New SOW</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>New Template</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <GitPullRequest className="mr-2 h-4 w-4" />
              <span>New Workflow</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right Controls: Dark/Light Mode, Settings, Profile */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="press-scale rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          className="press-scale rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>

        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
          {userInitials}
        </span>
      </div>
    </header>
  );
}
