'use client';

import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  FileEdit,
  Users,
  UserCheck,
  Stamp,
  PenLine,
  Rocket,
} from 'lucide-react';
import { Reveal } from './reveal';

const STEPS = [
  {
    icon: LayoutTemplate,
    title: 'Create Template',
    body: 'Start from a reusable, pre-approved template.',
  },
  {
    icon: FileEdit,
    title: 'Customize SOW',
    body: 'Fill scope, pricing, and timelines for this engagement.',
  },
  {
    icon: Users,
    title: 'Internal Review',
    body: 'Legal and delivery teams review and comment inline.',
  },
  {
    icon: UserCheck,
    title: 'Client Review',
    body: 'Client negotiates and redlines in the same workspace.',
  },
  {
    icon: Stamp,
    title: 'Approval',
    body: 'Routed automatically through the right approval chain.',
  },
  {
    icon: PenLine,
    title: 'Signature',
    body: 'Both parties sign electronically, no printing required.',
  },
  {
    icon: Rocket,
    title: 'Project Starts',
    body: 'Kickoff triggers instantly on final signature.',
  },
];

export function WorkflowSection() {
  return (
    <section id="workflow" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Workflow
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            From first draft to signed agreement
          </h2>
          <p className="mt-4 text-foreground/60">
            Seven steps. Zero email chains.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute top-6 right-0 left-0 hidden h-px bg-foreground/10 lg:block" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            className="absolute top-6 right-0 left-0 hidden h-px bg-gradient-to-r from-indigo-500 to-blue-500 lg:block"
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-7 lg:gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex flex-col items-center text-center lg:items-center"
              >
                <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-indigo-500/25 bg-card text-indigo-500 shadow-sm">
                  <step.icon className="size-5" />
                </span>
                <p className="font-display mt-3 text-sm font-semibold">
                  {step.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
