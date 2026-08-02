'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  PenLine,
  Sparkles,
  History,
} from 'lucide-react';
import { Button, Badge } from '@sow-platform/ui';

const titleWords = [
  'Statement',
  'of',
  'Work',
  'approvals',
  'that',
  'move',
  'as',
  'fast',
  'as',
  'your',
  'business.',
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-40 pb-24 sm:pt-48 sm:pb-32"
    >
      <div className="landing-grid-bg pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 landing-blob rounded-full bg-gradient-to-br from-indigo-500/25 via-blue-400/15 to-transparent blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-indigo-600 dark:text-indigo-300">
            <Sparkles className="size-3" />
            <span className="text-xs font-medium">
              Now with AI-assisted drafting
            </span>
          </Badge>
        </motion.div>

        <h1 className="font-display mx-auto mt-7 max-w-4xl text-[2.6rem] leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]">
          {titleWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.06 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`inline-block ${word === 'fast' ? 'bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent' : ''}`}
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-lg text-foreground/60 sm:text-xl"
        >
          Create, collaborate, negotiate, approve and sign Statements of Work in
          one intelligent workspace built for legal, procurement, and delivery
          teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link href="/tenant-admin">
            <Button className="h-12 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-7 text-base text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/35">
              Start Free
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            className="h-12 rounded-full border-foreground/15 px-7 text-base transition-all hover:scale-[1.02]"
          >
            Book a Demo
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-4 text-xs text-foreground/40"
        >
          No credit card required · SOC 2 Type II · 14-day free trial
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto mt-20 max-w-5xl px-4 [perspective:1600px] sm:px-6"
      >
        <div className="relative rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-indigo-950/10">
          <div className="flex items-center gap-1.5 border-b border-foreground/10 px-4 py-3">
            <span className="size-2.5 rounded-full bg-red-400/70" />
            <span className="size-2.5 rounded-full bg-amber-400/70" />
            <span className="size-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 text-xs text-foreground/40">
              app.statementos.com/sow/enterprise-rollout
            </span>
          </div>

          <div className="grid gap-px overflow-hidden bg-foreground/5 sm:grid-cols-[220px_1fr]">
            <div className="hidden flex-col gap-1 bg-card p-4 sm:flex">
              {[
                'Draft',
                'Internal Review',
                'Client Review',
                'Approved',
                'Signed',
              ].map((stage, i) => (
                <div
                  key={stage}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${i === 2 ? 'bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-300' : 'text-foreground/50'}`}
                >
                  {i < 2 ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                  ) : (
                    <Clock className="size-3.5" />
                  )}
                  {stage}
                </div>
              ))}
            </div>

            <div className="bg-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-sm font-semibold">
                    Enterprise Rollout — Phase 2
                  </p>
                  <p className="text-xs text-foreground/40">
                    v4.2 · Acme Consulting × Northwind Corp
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/30 text-amber-600 dark:text-amber-300"
                >
                  Awaiting client sign-off
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    icon: FileText,
                    label: 'Sections',
                    value: '12 / 12 complete',
                  },
                  {
                    icon: MessageSquare,
                    label: 'Comments',
                    value: '3 open threads',
                  },
                  {
                    icon: History,
                    label: 'Version history',
                    value: '9 revisions tracked',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-foreground/10 bg-background/60 p-3"
                  >
                    <item.icon className="size-4 text-indigo-500" />
                    <p className="mt-2 text-xs text-foreground/40">
                      {item.label}
                    </p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/60 p-3 text-xs text-foreground/60">
                <PenLine className="size-3.5 text-indigo-500" />
                Legal flagged clause 4.2 for review — awaiting response from
                Northwind Corp
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="landing-float absolute -right-4 -top-8 hidden rounded-xl border border-foreground/10 bg-card px-4 py-3 shadow-xl sm:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            Approved by Legal
          </div>
        </motion.div>

        <motion.div
          className="landing-float absolute -left-6 bottom-10 hidden rounded-xl border border-foreground/10 bg-card px-4 py-3 shadow-xl sm:block"
          style={{ animationDelay: '1.2s' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="flex size-5 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-medium text-white">
              AI
            </span>
            Risk detected in Section 4
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
