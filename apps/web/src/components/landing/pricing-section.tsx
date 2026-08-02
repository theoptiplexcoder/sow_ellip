import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button, Badge } from '@sow-platform/ui';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    body: 'For individuals and small teams getting started with structured SOWs.',
    features: [
      'Up to 5 active SOWs',
      'Standard templates',
      'Basic e-signatures',
      'Email support',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$79',
    period: 'per user / month',
    body: 'For growing teams that need approval workflows and collaboration.',
    features: [
      'Unlimited SOWs',
      'Custom templates + AI drafting',
      'Multi-stage approvals',
      'Version history & audit trail',
      'Slack & Teams notifications',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'billed annually',
    body: 'For organizations with advanced security and compliance needs.',
    features: [
      'Everything in Professional',
      'SSO & SCIM provisioning',
      'Custom roles & permissions',
      'Dedicated success manager',
      'Custom SLAs',
      'Advanced analytics',
    ],
    cta: 'Book Demo',
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Pricing
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple pricing that scales with you
          </h2>
          <p className="mt-4 text-foreground/60">
            Start free. Upgrade when your team needs more control.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <RevealItem key={plan.name}>
              <div
                className={`relative flex h-full flex-col rounded-2xl border p-7 transition-all hover:-translate-y-1 ${
                  plan.highlighted
                    ? 'border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.06] to-transparent shadow-xl shadow-indigo-500/10'
                    : 'border-foreground/10 bg-card/60 hover:border-foreground/20'
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    Most popular
                  </Badge>
                )}
                <p className="font-display text-sm font-semibold">
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-foreground/45">
                    / {plan.period}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground/55">{plan.body}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/70"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href="/tenant-admin" className="mt-7">
                  <Button
                    className={`h-11 w-full rounded-full ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-90'
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
