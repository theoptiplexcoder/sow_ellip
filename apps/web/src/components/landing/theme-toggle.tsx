'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('sow-landing-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const dark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem('sow-landing-theme', next ? 'dark' : 'light');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={
        className ??
        'relative flex size-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground'
      }
    >
      <Sun className="size-4 scale-100 dark:scale-0 transition-transform" />
      <Moon className="absolute size-4 scale-0 dark:scale-100 transition-transform" />
    </button>
  );
}
