import { Reveal } from './reveal';

const LOGOS = [
  'Northwind Consulting',
  'Vantage Legal',
  'Beacon Partners',
  'Halcyon Agency',
  'Meridian Group',
  'Fieldstone & Co',
  'Ledger Advisory',
  'Waverly Systems',
];

export function LogoMarquee() {
  return (
    <section className="border-y border-foreground/10 bg-foreground/[0.015] py-10">
      <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-medium tracking-wide text-foreground/40 uppercase">
          Trusted by consulting firms, agencies and enterprise teams
        </p>
      </Reveal>

      <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="landing-marquee-track flex w-max items-center gap-14">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="font-display shrink-0 text-lg font-semibold tracking-tight text-foreground/25"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
