'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@sow-platform/ui';
import { Reveal } from './reveal';

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-500" />
      <div className="landing-blob pointer-events-none absolute -top-24 left-1/4 -z-10 size-[420px] rounded-full bg-white/10 blur-3xl" />
      <div
        className="landing-blob pointer-events-none absolute -bottom-24 right-1/4 -z-10 size-[420px] rounded-full bg-white/10 blur-3xl"
        style={{ animationDelay: '4s' }}
      />
      <div className="landing-noise pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white text-balance sm:text-5xl">
            Ready to simplify Statement of Work approvals?
          </h2>
          <p className="mt-5 text-lg text-white/75">
            Join hundreds of consulting firms, agencies, and enterprise teams
            already moving faster with SOWork.
          </p>
        </Reveal>

        <Reveal
          delay={0.15}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/tenant-admin">
            <Button className="h-12 rounded-full bg-white px-7 text-base text-indigo-700 shadow-lg transition-all hover:scale-[1.03] hover:bg-white/90">
              Start Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-12 rounded-full border-white/30 bg-transparent px-7 text-base text-white transition-all hover:scale-[1.02] hover:bg-white/10"
          >
            Book Demo
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
