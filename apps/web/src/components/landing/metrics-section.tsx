import { AnimatedCounter } from './animated-counter';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const METRICS = [
  { value: 99.9, suffix: '%', decimals: 1, label: 'Platform uptime' },
  { value: 50, suffix: '%', label: 'Faster approvals' },
  { value: 10, suffix: 'x', label: 'Less paperwork' },
  { value: 40000, suffix: '+', label: 'SOWs managed' },
];

export function MetricsSection() {
  return (
    <section className="relative overflow-hidden border-y border-foreground/10 bg-gradient-to-b from-transparent via-indigo-500/[0.03] to-transparent py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Numbers that speak for themselves
          </h2>
        </Reveal>

        <RevealGroup className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {METRICS.map((m) => (
            <RevealItem key={m.label} className="text-center">
              <p className="font-display bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
                <AnimatedCounter
                  value={m.value}
                  suffix={m.suffix}
                  decimals={m.decimals ?? 0}
                />
              </p>
              <p className="mt-2 text-sm text-foreground/50">{m.label}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
