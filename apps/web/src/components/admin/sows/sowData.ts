export type SowStatus = 'DRAFT' | 'PUBLISHED';

export type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  project: string;
  status: SowStatus;
  version: number;
  updatedAt: string;
  description: string;
  templateId: string;
  awaitingApproval?: boolean;
};

export const ADMIN_SOWS: SowRow[] = [
  {
    id: 's-1',
    sowNumber: 'SOW-1042',
    title: 'Website revamp — Phase 1',
    project: 'Website revamp',
    status: 'PUBLISHED',
    version: 2,
    updatedAt: '2026-07-20',
    description: 'Redesign and rebuild of the client-facing marketing site, including a new component library, CMS integration, and a phased content migration from the legacy platform.',
    templateId: 't-1',
  },
  {
    id: 's-2',
    sowNumber: 'SOW-1051',
    title: 'Data migration plan',
    project: 'Data migration',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-07-25',
    description: 'Migration of production data from the legacy on-prem warehouse to the new cloud data platform, covering schema mapping, validation, and a zero-downtime cutover plan.',
    templateId: 't-2',
  },
  {
    id: 's-3',
    sowNumber: 'SOW-1055',
    title: 'Support retainer renewal',
    project: 'Support retainer',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-07-27',
    description: 'Renewal of the ongoing monthly support retainer covering bug fixes, minor enhancements, and on-call incident response for the client\'s existing platform.',
    templateId: 't-3',
  },
  {
    id: 's-4',
    sowNumber: 'SOW-1048',
    title: 'Phase 2 scope addendum',
    project: 'Website revamp',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-07-18',
    description: 'Addendum covering additional Phase 2 deliverables for the website revamp, including a client portal login and account management screens not in the original scope.',
    templateId: 't-1',
  },
  {
    id: 's-5',
    sowNumber: 'SOW-1060',
    title: 'Cloud infrastructure migration',
    project: 'Cloud migration',
    status: 'PUBLISHED',
    version: 1,
    updatedAt: '2026-07-29',
    description: 'Migration of core services to the new cloud infrastructure provider, including networking setup, security hardening, and a phased service cutover. Awaiting participant approval before work begins.',
    templateId: 't-2',
    awaitingApproval: true,
  },
];
