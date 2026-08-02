'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { FileCheck2, Menu, X } from 'lucide-react';
import { Button } from '@sow-platform/ui';
import { ThemeToggle } from './theme-toggle';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#showcase', label: 'Templates' },
  { href: '#security', label: 'Security' },
  { href: '#pricing', label: 'Pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24);
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40"
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-300 sm:px-6 ${
          scrolled
            ? 'mt-3 landing-glass rounded-2xl border border-foreground/10 py-2.5 px-4 shadow-lg shadow-black/5 sm:px-5'
            : 'mt-0 py-5'
        }`}
      >
        <Link
          href="#top"
          className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-sm shadow-indigo-500/30">
            <FileCheck2 className="size-4" />
          </span>
          <span className="hidden sm:inline">
            Statement<span className="text-indigo-500">OS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm text-foreground/65 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Button variant="ghost" className="h-9 rounded-full px-4">
            Book Demo
          </Button>
          <Link href="/tenant-admin">
            <Button className="h-9 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 text-white shadow-md shadow-indigo-500/25 hover:opacity-90 hover:shadow-lg hover:shadow-indigo-500/30">
              Start Free
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full border border-foreground/10 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="size-4.5" />
          ) : (
            <Menu className="size-4.5" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="landing-glass mx-4 mt-2 flex flex-col gap-1 rounded-2xl border border-foreground/10 p-3 shadow-xl md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm text-foreground/75 hover:bg-foreground/5"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-foreground/10 pt-3">
            <ThemeToggle />
            <Button variant="ghost" className="h-9 flex-1 rounded-full">
              Book Demo
            </Button>
            <Link href="/tenant-admin" className="flex-1">
              <Button className="h-9 w-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                Start Free
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
