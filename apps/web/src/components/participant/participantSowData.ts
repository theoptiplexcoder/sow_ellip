import type { JSONContent } from '@tiptap/core';
import type { FieldDraft } from '../admin/sows/builder/fieldTypes';
import type { SchemaOverride } from '../admin/sows/templateStore';
import { SAVED_TEMPLATES } from '../admin/sows/savedTemplates';

const FALLBACK_TEMPLATE_IDS = ['t-1', 't-2', 't-3'];
const TEMPLATE_IDS =
  SAVED_TEMPLATES.length > 0 ? SAVED_TEMPLATES.map((t) => t.id as string) : FALLBACK_TEMPLATE_IDS;

function templateIdAt(index: number): string {
  return TEMPLATE_IDS[index % TEMPLATE_IDS.length];
}

export type SowStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REQUIRES_APPROVAL';

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
  formData?: Record<string, unknown>;
  fields?: FieldDraft[];
  schemaOverride?: SchemaOverride | null;
  body?: JSONContent;
};

export const PARTICIPANT_SOWS: SowRow[] = [
  {
    id: 's-1',
    sowNumber: 'SOW-1040',
    title: 'Brand guidelines refresh',
    project: 'Brand refresh',
    status: 'DRAFT',
    version: 1,
    updatedAt: '2026-07-15',
    description: 'Updated brand guidelines covering logo usage, color palette, and typography for all client-facing collateral.',
    templateId: templateIdAt(0),
  },
  {
    id: 's-2',
    sowNumber: 'SOW-1051',
    title: 'Data migration plan',
    project: 'Data migration',
    status: 'IN_REVIEW',
    version: 1,
    updatedAt: '2026-07-25',
    description: 'Migration of production data from the legacy on-prem warehouse to the new cloud data platform, covering schema mapping, validation, and a zero-downtime cutover plan.',
    templateId: templateIdAt(1),
  },
  {
    id: 's-3',
    sowNumber: 'SOW-1055',
    title: 'Support retainer renewal',
    project: 'Ongoing support',
    status: 'REQUIRES_APPROVAL',
    version: 1,
    updatedAt: '2026-07-28',
    description: 'Renewal of the monthly support retainer with updated response-time SLAs and escalation contacts.',
    templateId: templateIdAt(2),
    awaitingApproval: true,
  },
  {
    id: 's-4',
    sowNumber: 'SOW-1048',
    title: 'Phase 2 scope addendum',
    project: 'Website revamp',
    status: 'CHANGES_REQUESTED',
    version: 1,
    updatedAt: '2026-07-18',
    description: 'Addendum covering additional Phase 2 deliverables for the website revamp, including a client portal login and account management screens not in the original scope.',
    templateId: templateIdAt(0),
  },
  {
    id: 's-5',
    sowNumber: 'SOW-1033',
    title: 'Legacy API decommission',
    project: 'Platform cleanup',
    status: 'REJECTED',
    version: 1,
    updatedAt: '2026-07-05',
    description: 'Proposal to sunset the legacy v1 API in favor of the v2 endpoints, including a client migration timeline.',
    templateId: templateIdAt(1),
  },
  {
    id: 's-6',
    sowNumber: 'SOW-1042',
    title: 'Website revamp — Phase 1',
    project: 'Website revamp',
    status: 'APPROVED',
    version: 2,
    updatedAt: '2026-07-20',
    description: 'Redesign and rebuild of the client-facing marketing site, including a new component library, CMS integration, and a phased content migration from the legacy platform.',
    templateId: templateIdAt(2),
  },
  {
    id: 's-7',
    sowNumber: 'SOW-1029',
    title: 'Onboarding automation rollout',
    project: 'Internal tooling',
    status: 'PUBLISHED',
    version: 3,
    updatedAt: '2026-06-30',
    description: 'Automated onboarding workflow for new consultants, covering account provisioning, training checklists, and access reviews.',
    templateId: templateIdAt(0),
  },
];
