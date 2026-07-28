import { FadeIn } from './FadeIn';

const TESTIMONIALS = [
  {
    quote:
      'Approvals used to live in scattered email threads. Now every SOW has one version of the truth.',
    name: 'Operations Director',
    context: 'Professional services firm',
    initials: 'OD',
  },
  {
    quote:
      'Our approvers stopped re-reading entire documents. They see what changed, sign off, and it moves.',
    name: 'Head of Delivery',
    context: 'Consulting practice',
    initials: 'HD',
  },
  {
    quote:
      'The permanent audit trail is what got this past legal — every edit is timestamped and searchable.',
    name: 'VP of Operations',
    context: 'Managed services provider',
    initials: 'VP',
  },
];

export function Testimonials() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Testimonials
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Trusted by operations teams
          </h2>
        </FadeIn>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.06}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover-lift">
                <span className="mb-4 font-display text-4xl leading-none text-primary/20">
                  &ldquo;
                </span>
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-display text-xs font-bold text-primary">
                    {t.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {t.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t.context}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
