import { Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@sow-platform/ui';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const TESTIMONIALS = [
  {
    quote:
      'We cut our average SOW approval time from three weeks to under three days. The audit trail alone has paid for the platform.',
    name: 'Sarah Chen',
    title: 'VP Operations, Northwind Consulting',
    initials: 'SC',
  },
  {
    quote:
      'Version confusion used to be our biggest source of client disputes. Now everyone works off one source of truth, always.',
    name: 'Marcus Lee',
    title: 'General Counsel, Vantage Legal',
    initials: 'ML',
  },
  {
    quote:
      'The AI risk detection caught a liability clause our junior associates missed twice. It genuinely changed our review process.',
    name: 'Priya Nair',
    title: 'Director of Delivery, Beacon Partners',
    initials: 'PN',
  },
  {
    quote:
      'Our clients love the portal — they can see exactly where their SOW stands without emailing us for updates.',
    name: 'James Whitfield',
    title: 'Founder, Halcyon Agency',
    initials: 'JW',
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Testimonials
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Loved by teams who used to dread SOWs
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <RevealItem key={t.name}>
              <div className="group h-full rounded-2xl border border-foreground/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="font-display mt-4 text-lg leading-snug text-foreground/85">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-blue-500/20 font-medium text-indigo-600 dark:text-indigo-300">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-foreground/45">{t.title}</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
