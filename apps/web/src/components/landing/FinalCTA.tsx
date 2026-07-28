import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from './FadeIn';

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-primary">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 z-0 opacity-15" />
      <div className="relative mx-auto max-w-7xl px-6 py-28 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Draft your first SOW,<br className="hidden sm:block" /> no fuss
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base text-primary-foreground/80">
            No credit card required. Set up in a few minutes.
          </p>
          <Link
            href="/auth/signup"
            className="press-scale mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-primary shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-white/10"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
