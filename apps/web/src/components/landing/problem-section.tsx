import {
  Mail,
  GitBranch,
  Hourglass,
  PenTool,
  FolderX,
  ArrowDown,
} from 'lucide-react';
import { Reveal, RevealGroup, RevealItem } from './reveal';

const PROBLEMS = [
  {
    icon: Mail,
    title: 'Endless email chains',
    body: 'Redlines buried across a dozen threads with no single source of truth.',
  },
  {
    icon: GitBranch,
    title: 'Version confusion',
    body: '"SOW_final_v3_FINAL.docx" — nobody knows which copy is actually approved.',
  },
  {
    icon: Hourglass,
    title: 'Approval delays',
    body: "Sign-off stalls in someone's inbox for weeks with no visibility into why.",
  },
  {
    icon: PenTool,
    title: 'Manual signatures',
    body: 'Printing, scanning, and chasing signatures across three time zones.',
  },
  {
    icon: FolderX,
    title: 'Lost documents',
    body: 'Executed agreements scattered across drives, inboxes, and desktops.',
  },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            The old way of managing SOWs is quietly costing you deals
          </h2>
          <p className="mt-4 text-foreground/60">
            Every day spent chasing approvals is a day your project doesn't
            start.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PROBLEMS.map((p) => (
            <RevealItem key={p.title}>
              <div className="group h-full rounded-2xl border border-foreground/10 bg-card/60 p-5 transition-all hover:-translate-y-1 hover:border-red-500/20 hover:shadow-lg">
                <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <p.icon className="size-4" />
                </div>
                <p className="mt-3 font-display text-sm font-semibold">
                  {p.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                  {p.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-14 flex flex-col items-center gap-3">
          <ArrowDown className="size-5 text-indigo-500" />
          <p className="font-display text-xl font-semibold">
            <span className="bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
              SOWork
            </span>{' '}
            fixes this.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
