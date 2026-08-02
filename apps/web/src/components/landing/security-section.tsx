import {
  Lock,
  ShieldCheck,
  KeyRound,
  ScrollText,
  DatabaseBackup,
  BadgeCheck,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const SECURITY = [
  {
    icon: BadgeCheck,
    title: 'SOC 2 Type II',
    body: 'Independently audited controls for security, availability, and confidentiality.',
  },
  {
    icon: Lock,
    title: 'Encryption everywhere',
    body: 'AES-256 at rest, TLS 1.3 in transit, for every document and comment.',
  },
  {
    icon: KeyRound,
    title: 'Role permissions',
    body: 'Granular access control down to the field and clause level.',
  },
  {
    icon: ScrollText,
    title: 'Audit logs',
    body: 'Immutable, timestamped record of every action across the platform.',
  },
  {
    icon: DatabaseBackup,
    title: 'Backups',
    body: 'Automated, geo-redundant backups with point-in-time recovery.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance ready',
    body: 'GDPR and CCPA aligned data handling out of the box.',
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="relative overflow-hidden py-24 sm:py-32">
      <div className="landing-grid-bg pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Security &amp; trust
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Enterprise-grade, from day one
          </h2>
          <p className="mt-4 text-foreground/60">
            Your contracts contain your most sensitive commitments. We treat
            them that way.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map((s) => (
            <RevealItem key={s.title}>
              <div className="h-full rounded-2xl border border-foreground/10 bg-card/70 p-6 landing-glass transition-all hover:border-indigo-500/25">
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                  <s.icon className="size-4.5" />
                </div>
                <p className="font-display mt-4 text-[15px] font-semibold">
                  {s.title}
                </p>
                <p className="mt-1.5 text-sm text-foreground/55">{s.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
