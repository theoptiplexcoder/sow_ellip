import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from './FadeIn';

const STEPS = [
  { step: '01', title: 'Draft', description: 'Start from a template or blank — structured fields keep it tight.' },
  { step: '02', title: 'Route', description: 'Every SOW moves through your approval chain automatically.' },
  { step: '03', title: 'Approve', description: 'Approvers see exactly what changed and sign off in one click.' },
];

export function Workflow() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">
        <div>
          <FadeIn>
            <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
              Workflow
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Never too late<br className="hidden lg:block" /> to change course
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Stop managing SOWs across email and shared drives. Every version
              sits side by side, so drift gets flagged early.
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="mt-10 space-y-6">
              {STEPS.map((s) => (
                <div key={s.step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-display text-xs font-bold text-primary">
                    {s.step}
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.14}>
            <Link
              href="/auth/signup"
              className="press-scale mt-10 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
            >
              See it in action
              <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
        </div>

        <FadeIn delay={0.1}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-accent/60 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-lg">
              <div className="overflow-hidden rounded-xl border border-border">
                <Image
                  src="/landing_asset.png"
                  alt="A statement of work document with its approval status highlighted"
                  width={854}
                  height={612}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
