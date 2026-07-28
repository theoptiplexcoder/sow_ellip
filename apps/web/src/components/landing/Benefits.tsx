import { Zap, ShieldCheck, Lock } from 'lucide-react';
import { FadeIn } from './FadeIn';

const PILLARS = [
  {
    index: '01',
    icon: Zap,
    title: 'Efficiency',
    description: 'Draft and route an SOW in minutes, not days lost to email.',
    points: ['Minutes to draft', 'One shared record', 'Approvals trigger themselves'],
  },
  {
    index: '02',
    icon: ShieldCheck,
    title: 'Feasibility',
    description: "See what a change would cost before it's approved.",
    points: ['Change-impact visible pre-approval', 'Pipeline analytics', 'Drift flagged early'],
  },
  {
    index: '03',
    icon: Lock,
    title: 'Robustness',
    description: 'Role-based access and a permanent audit trail, built for compliance.',
    points: ['Role-scoped access', 'Full audit trail', 'Connects to your tools'],
  },
];

export function Benefits() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Why SOW Platform
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Three promises,<br className="hidden sm:block" /> kept every time
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            The three reasons teams switch and stay.
          </p>
        </FadeIn>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {PILLARS.map((pillar, i) => (
            <FadeIn key={pillar.title} delay={i * 0.06}>
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover-lift">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                    <pillar.icon className="h-5 w-5 text-primary transition-colors duration-200 group-hover:text-primary-foreground" />
                  </span>
                  <span className="font-display text-3xl font-bold text-border transition-colors duration-200 group-hover:text-primary/20">
                    {pillar.index}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {pillar.description}
                </p>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
