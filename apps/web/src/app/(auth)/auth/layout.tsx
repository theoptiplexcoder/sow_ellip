import Image from 'next/image';
import Link from 'next/link';
import { FileText, GitPullRequest, History } from 'lucide-react';
import { AuthTabs } from '../../../components/auth/AuthTabs';

const FEATURES = [
  {
    icon: FileText,
    title: 'Structured SOW Builder',
    description: 'All 15+ fields, deliverables, milestones, and pricing in one form',
  },
  {
    icon: GitPullRequest,
    title: 'Sequential Approval Workflows',
    description: 'Define ordered steps with assigned approvers per step',
  },
  {
    icon: History,
    title: 'Full Audit Trail',
    description: 'Every action logged, scoped to your organization',
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 items-center rounded-md bg-white px-2 py-1">
              <Image src="/logo.jpeg" alt="SOWwork" width={146} height={110} className="h-7 w-auto" priority />
            </span>
          </Link>

          <h1 className="mt-16 max-w-md font-display text-4xl leading-[1.15] font-semibold">
            Structured SOWs. Seamless Approvals.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            Create professional Statements of Work, route them through configurable approval workflows, and export
            print-ready PDFs — all in one secure, multi-tenant platform.
          </p>

          <div className="mt-12 space-y-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <feature.icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-primary-foreground/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/50">© 2026 SOW Platform · Secure multi-tenant SaaS</p>
      </div>

      <div className="flex flex-col px-6 py-10 sm:px-10 lg:px-16">
        <Link href="/" className="flex w-fit items-center gap-2 lg:hidden">
          <Image src="/logo.jpeg" alt="SOWwork" width={146} height={110} className="h-9 w-auto" priority />
        </Link>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <AuthTabs />
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
