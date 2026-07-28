import Link from 'next/link';
import { Check } from 'lucide-react';
import { FadeIn } from './FadeIn';

const PLANS = [
  {
    name: 'Team',
    price: '$29',
    period: '/user/mo',
    description: 'For small teams getting approvals out of email.',
    features: [
      'Unlimited SOWs',
      'Structured templates',
      'Basic approval routing',
      'Email support',
    ],
    featured: false,
  },
  {
    name: 'Business',
    price: '$59',
    period: '/user/mo',
    description: 'For organizations with formal approval chains.',
    features: [
      'Everything in Team',
      'Custom approval workflows',
      'Full audit trail & version history',
      'Role-based access',
      'Priority support',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For orgs with compliance and integration needs.',
    features: [
      'Everything in Business',
      'SSO & SCIM provisioning',
      'Dedicated onboarding',
      'Custom integrations',
      'SLA-backed support',
    ],
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Simple, no-fuss pricing
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Per seat, no setup fees.
          </p>
        </FadeIn>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.06}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-7 transition-all duration-200 ${
                  plan.featured
                    ? 'border-primary/30 bg-gradient-to-b from-accent to-background shadow-md ring-1 ring-primary/10'
                    : 'border-border bg-card hover-lift'
                }`}
              >
                {plan.featured && (
                  <span className="mb-4 inline-block w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </p>
                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className={`press-scale mt-8 rounded-xl px-5 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary-hover'
                      : 'border border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  Get started
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
