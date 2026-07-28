'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './FadeIn';

const FAQS = [
  {
    q: "What happens to an SOW once it's approved?",
    a: "It's locked from further edits and moves into the audit log with its full version history. Changing scope requires a new version through the same approval chain.",
  },
  {
    q: 'Can an approver ask for changes instead of just approving or rejecting?',
    a: 'Yes. Approvers can send an SOW back with specific comments attached to the fields in question, and the participant resubmits once it\u2019s addressed.',
  },
  {
    q: 'Is every edit tracked, even before submission?',
    a: 'Draft edits are tracked from the first save. Once submitted, the version that was actually reviewed is the one preserved in the audit trail.',
  },
  {
    q: 'Can I reuse a previous SOW as a starting point?',
    a: 'Yes \u2014 clone any existing SOW or start from an org template. Both keep the same field structure so approvals stay consistent.',
  },
  {
    q: 'Who can see the audit log?',
    a: 'Admins, approvers, and executive viewers. SOW participants see the history of their own work; org-wide audit access is an admin-granted permission.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-3xl px-6 py-24">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            FAQ
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
        </FadeIn>
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  <Plus
                    className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ease-[var(--ease-out-snap)] ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
