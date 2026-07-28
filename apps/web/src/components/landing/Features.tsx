import { FileText, GitPullRequest, ClipboardCheck, History, Users, GitCompare } from 'lucide-react';
import { FadeIn } from './FadeIn';

const FEATURES = [
  {
    icon: FileText,
    title: 'Structured drafting',
    description:
      'Scope, rates, and milestones live in structured fields, not a drifting Word doc.',
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
    accent: true,
  },
  {
    icon: GitCompare,
    title: 'Change-impact preview',
    description: 'See what a scope change costs before you approve it.',
    span: 'sm:col-span-2 lg:col-span-2',
    accent: false,
  },
  {
    icon: GitPullRequest,
    title: 'Automated routing',
    description: 'Every SOW moves through your approval chain automatically.',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    icon: ClipboardCheck,
    title: 'One-click approvals',
    description: 'Approvers see what changed and sign off without re-reading.',
    span: 'lg:col-span-1',
    accent: false,
  },
  {
    icon: History,
    title: 'Permanent audit trail',
    description: 'Every edit, comment, and signature is timestamped and searchable.',
    span: 'sm:col-span-2 lg:col-span-2',
    accent: false,
  },
  {
    icon: Users,
    title: 'Role-scoped access',
    description: 'Each role sees exactly what it needs, nothing more.',
    span: 'sm:col-span-2 lg:col-span-2',
    accent: false,
  },
];

export function Features() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
            Features
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Built for how scope<br className="hidden sm:block" /> actually moves
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Everything an SOW needs, from first draft to final signature.
          </p>
        </FadeIn>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.05} className={feature.span}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-6 transition-all duration-200 ${
                  feature.accent
                    ? 'border-primary/20 bg-gradient-to-br from-accent to-background shadow-sm'
                    : 'border-border bg-card hover-lift'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    feature.accent ? 'bg-primary text-primary-foreground' : 'bg-accent text-primary'
                  }`}
                >
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
