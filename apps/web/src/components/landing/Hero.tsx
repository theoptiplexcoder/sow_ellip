import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, GitBranch } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { DashboardMockup } from './DashboardMockup';

const STATS = [
  { value: '80%', label: 'Less scope drift' },
  { value: '3×', label: 'Faster approvals' },
  { value: '100%', label: 'Audit-ready' },
];

const PILLARS = [
  { label: 'Efficient by default', icon: Zap },
  { label: 'Feasibility built in', icon: ShieldCheck },
  { label: 'Audit-grade robustness', icon: GitBranch },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-noise">
      <div aria-hidden className="bg-mesh pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-12">
          <div>
            <FadeIn>
              <p className="mb-5 inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold tracking-wide text-accent-foreground uppercase">
                No-fuss SOW management
              </p>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1 className="font-display text-4xl leading-[1.08] font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] xl:text-[4rem]">
                Catch scope changes while it&rsquo;s still{' '}
                <span className="text-gradient">cheap to fix</span> them.
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
                One record for scope, rates, and sign-off — routed through your
                approval chain, so drift surfaces early.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/auth/signup"
                  className="press-scale inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/signin"
                  className="press-scale rounded-xl border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Sign in
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-6">
                {PILLARS.map((pillar) => (
                  <span key={pillar.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <pillar.icon className="h-4 w-4 shrink-0 text-primary" />
                    {pillar.label}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.12}>
            <DashboardMockup />
          </FadeIn>
        </div>

        {/* Social proof stats */}
        <FadeIn delay={0.25}>
          <div className="mt-16 grid grid-cols-3 gap-3 sm:gap-6 border-t border-border pt-10 sm:max-w-lg lg:mt-20">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
