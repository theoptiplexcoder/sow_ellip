import Link from 'next/link';
import { FileCheck2, MessageCircle, Share2, Code2 } from 'lucide-react';
import { Separator } from '@sow-platform/ui';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Workflow', href: '#workflow' },
      { label: 'Templates', href: '#showcase' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Security', href: '#security' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-foreground/10 bg-foreground/[0.015] pt-16 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="#top"
              className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-blue-500 text-white">
                <FileCheck2 className="size-4" />
              </span>
              SO<span className="text-indigo-500">Work</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-foreground/50">
              Statement of Work creation, collaboration, review, and approval —
              built for modern businesses.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[MessageCircle, Share2, Code2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-8 items-center justify-center rounded-full border border-foreground/10 text-foreground/50 transition-all hover:-translate-y-0.5 hover:border-indigo-500/30 hover:text-indigo-500"
                >
                  <Icon className="size-3.5" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-foreground/40 sm:flex-row">
          <p>© 2026 SOWork. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
            <a href="#" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
