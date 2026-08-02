'use client';

import { motion } from 'framer-motion';
import { Clock3, Gauge, Library, ShieldCheck, Eye } from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const BENEFITS = [
  {
    icon: Clock3,
    title: 'Save hours every week',
    body: 'Templates and automation eliminate repetitive drafting work.',
  },
  {
    icon: Gauge,
    title: 'Reduce approval time',
    body: 'Structured workflows cut review cycles from weeks to days.',
  },
  {
    icon: Library,
    title: 'Centralize documentation',
    body: 'Every SOW, version, and signature lives in one searchable place.',
  },
  {
    icon: ShieldCheck,
    title: 'Improve compliance',
    body: 'Standardized clauses and audit trails reduce legal risk.',
  },
  {
    icon: Eye,
    title: 'Increase visibility',
    body: 'Leadership sees bottlenecks and status in real time, not after the fact.',
  },
];

export function BenefitsSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <Reveal className="order-2 lg:order-1">
          <div className="relative rounded-2xl border border-foreground/10 bg-gradient-to-br from-indigo-500/[0.06] to-blue-500/[0.03] p-8">
            <div className="landing-blob absolute -left-10 -top-10 size-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative space-y-3">
              {[92, 68, 100].map((width, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${width}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400"
                />
              ))}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                    className="aspect-square rounded-xl border border-foreground/10 bg-card shadow-sm"
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
              Why teams switch
            </span>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for teams who can't afford friction
            </h2>
          </Reveal>

          <RevealGroup className="mt-8 space-y-5">
            {BENEFITS.map((b) => (
              <RevealItem key={b.title} className="flex items-start gap-4">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                  <b.icon className="size-4" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold">
                    {b.title}
                  </p>
                  <p className="mt-1 text-sm text-foreground/55">{b.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
