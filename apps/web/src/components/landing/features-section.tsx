import {
  LayoutTemplate,
  Workflow,
  History,
  MessagesSquare,
  ShieldCheck,
  Users,
  Sparkles,
  FileOutput,
  PenLine,
  Bell,
  BarChart3,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Intelligent Templates',
    body: 'Create reusable SOW templates with dynamic clauses, pricing tables, and scoped variables.',
    span: 'lg:col-span-2',
  },
  {
    icon: Workflow,
    title: 'Approval Workflow',
    body: 'Multi-stage approval pipelines that route automatically by role, value, or risk.',
  },
  {
    icon: History,
    title: 'Version History',
    body: 'Every edit tracked. Compare, restore, or branch from any prior revision.',
  },
  {
    icon: MessagesSquare,
    title: 'Live Collaboration',
    body: 'Inline comments and @mentions keep stakeholders aligned in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Audit Trail',
    body: 'Every view, edit, and approval logged with timestamp and actor.',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    body: 'Granular permissions for clients, project managers, and legal teams.',
  },
  {
    icon: Sparkles,
    title: 'AI Assistance',
    body: 'Generate sections, summarize changes, and flag risky language automatically.',
    span: 'lg:col-span-2',
  },
  {
    icon: FileOutput,
    title: 'Document Generation',
    body: 'Export polished DOCX, PDF, or signed copies in one click.',
  },
  {
    icon: PenLine,
    title: 'E-Signatures',
    body: 'Integrated signing built directly into the approval flow.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    body: 'Stay in sync via Slack, email, or Microsoft Teams.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'Track approval times, completion rate, and bottlenecks across teams.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-medium tracking-wide text-indigo-500 uppercase">
            Platform
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a modern SOW workflow needs
          </h2>
          <p className="mt-4 text-foreground/60">
            One workspace for templates, review, approvals, signatures, and
            reporting.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <RevealItem key={f.title} className={f.span}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-b from-card to-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/5">
                <div className="absolute -right-8 -top-8 size-24 rounded-full bg-indigo-500/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-blue-500/10 text-indigo-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <f.icon className="size-4.5" />
                </div>
                <p className="font-display mt-4 text-[15px] font-semibold">
                  {f.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">
                  {f.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
