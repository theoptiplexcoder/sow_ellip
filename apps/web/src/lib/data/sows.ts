export type SowStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  | 'archived';

export interface WorkflowInstanceStep {
  id: string;
  name: string;
  actor: string;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'changes_requested'
    | 'not_reached';
  comment?: string;
  decidedAt?: string;
}

export interface SowRevision {
  id: string;
  version: number;
  submittedAt: string | null;
  status: SowStatus;
  workflowInstanceSteps: WorkflowInstanceStep[];
}

export interface Sow {
  id: string;
  number: string;
  title: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  status: SowStatus;
  version: number;
  updatedAt: string;
  creator: string;
  workflowTemplateName: string;
  sections: {
    objectives: string;
    scope: string;
    deliverables: string[];
    milestones: { name: string; dueDate: string }[];
    periodStart: string;
    periodEnd: string;
    acceptanceCriteria: string;
    dependencies: string;
    risks: string;
    assumptions: string;
    notes: string;
    pricing: { item: string; amount: string }[];
  };
  revisions: SowRevision[];
  /** Name of the template this SOW was generated from, if created via the template-based flow. */
  templateName?: string;
  /** Filled-in document body (HTML) produced by the New SOW flow's docx editor. */
  documentHtml?: string;
}

export const sows: Sow[] = [
  {
    id: 'sow-1042',
    number: 'SOW-1042',
    title: 'Storefront Rollout - Phase 2 Build',
    clientId: 'client-1',
    clientName: 'Harborline Retail Co.',
    projectId: 'proj-1',
    projectName: 'Storefront Modernization Phase 2',
    status: 'in_review',
    version: 1,
    updatedAt: '2026-07-30',
    creator: 'Casey Odom',
    workflowTemplateName: 'Standard Workflow',
    sections: {
      objectives:
        'Deliver a modernized storefront experience across web and mobile for Harborline retail locations.',
      scope:
        'Includes redesign of checkout flow, inventory sync with existing POS, and rollout to 12 pilot stores.',
      deliverables: [
        'Responsive storefront UI',
        'POS inventory sync service',
        'Pilot rollout runbook',
      ],
      milestones: [
        { name: 'Design sign-off', dueDate: '2026-08-15' },
        { name: 'Pilot store launch', dueDate: '2026-09-30' },
      ],
      periodStart: '2026-08-01',
      periodEnd: '2026-11-30',
      acceptanceCriteria:
        'All 12 pilot stores processing live transactions with < 1% sync error rate for 2 consecutive weeks.',
      dependencies:
        'Access to Harborline POS sandbox environment by 2026-08-05.',
      risks:
        'POS vendor API rate limits may affect sync latency during peak hours.',
      assumptions:
        'Harborline IT provides network access within 5 business days of request.',
      notes: 'Client prefers weekly status calls on Thursdays.',
      pricing: [
        { item: 'Design & UX', amount: '$28,000' },
        { item: 'Engineering (Phase 2)', amount: '$96,000' },
        { item: 'Pilot support (60 days)', amount: '$14,000' },
      ],
    },
    revisions: [
      {
        id: 'sow-1042-r1',
        version: 1,
        submittedAt: '2026-07-30',
        status: 'in_review',
        workflowInstanceSteps: [
          {
            id: 'wis1',
            name: 'Manager Review',
            actor: 'Dana Whitfield',
            status: 'approved',
            decidedAt: '2026-07-30 15:11',
          },
          {
            id: 'wis2',
            name: 'Finance Sign-off',
            actor: 'Ravi Kapoor',
            status: 'pending',
          },
        ],
      },
    ],
  },
  {
    id: 'sow-1039',
    number: 'SOW-1039',
    title: 'Patient Portal API Integration',
    clientId: 'client-3',
    clientName: 'Meridian Health Partners',
    projectId: 'proj-3',
    projectName: 'Patient Portal Integration',
    status: 'changes_requested',
    version: 2,
    updatedAt: '2026-07-28',
    creator: 'Priya Shah',
    workflowTemplateName: '3-Step Legal Review',
    sections: {
      objectives:
        'Integrate Meridian patient portal with the scheduling and billing APIs.',
      scope:
        'API integration, HIPAA-compliant data handling, and patient-facing scheduling UI.',
      deliverables: [
        'Scheduling API integration',
        'Billing sync module',
        'HIPAA compliance audit report',
      ],
      milestones: [{ name: 'API contract finalized', dueDate: '2026-08-01' }],
      periodStart: '2026-07-15',
      periodEnd: '2026-12-01',
      acceptanceCriteria:
        'Scheduling and billing data reconcile with zero discrepancies across a 30-day trial.',
      dependencies: 'Meridian legal approval of data processing agreement.',
      risks: 'Regulatory review timeline may extend beyond estimated schedule.',
      assumptions:
        'Meridian provides sandbox EHR access within 10 business days.',
      notes:
        'Legal flagged the data processing agreement for a second review pass.',
      pricing: [
        { item: 'Integration engineering', amount: '$140,000' },
        { item: 'Compliance review', amount: '$22,000' },
      ],
    },
    revisions: [
      {
        id: 'sow-1039-r1',
        version: 1,
        submittedAt: '2026-07-10',
        status: 'changes_requested',
        workflowInstanceSteps: [
          {
            id: 'wis3',
            name: 'Legal Intake',
            actor: 'Marcus Yee',
            status: 'changes_requested',
            comment:
              'Pricing table incomplete - add compliance review line item.',
            decidedAt: '2026-07-28 10:05',
          },
          {
            id: 'wis4',
            name: 'Compliance Review',
            actor: 'Dana Whitfield',
            status: 'not_reached',
          },
          {
            id: 'wis5',
            name: 'Executive Sign-off',
            actor: 'Ravi Kapoor',
            status: 'not_reached',
          },
        ],
      },
      {
        id: 'sow-1039-r2',
        version: 2,
        submittedAt: null,
        status: 'draft',
        workflowInstanceSteps: [],
      },
    ],
  },
  {
    id: 'sow-1050',
    number: 'SOW-1050',
    title: 'Cloud Migration Wave 1 - Compute & Storage',
    clientId: 'client-5',
    clientName: 'Nimbus Cloud Ventures',
    projectId: 'proj-5',
    projectName: 'Cloud Migration Wave 1',
    status: 'draft',
    version: 1,
    updatedAt: '2026-07-15',
    creator: 'Ravi Kapoor',
    workflowTemplateName: 'Standard Workflow',
    sections: {
      objectives:
        'Migrate core compute and storage workloads to the target cloud environment.',
      scope:
        'Lift-and-shift of 40 VMs and associated storage volumes with minimal downtime.',
      deliverables: [
        'Migration runbook',
        'Cutover plan',
        'Post-migration validation report',
      ],
      milestones: [{ name: 'Migration wave complete', dueDate: '2026-09-01' }],
      periodStart: '2026-07-20',
      periodEnd: '2026-09-15',
      acceptanceCriteria:
        'All workloads operational in target environment with < 4 hours total downtime.',
      dependencies:
        'Network peering established between source and target environments.',
      risks: 'Legacy application dependencies not fully documented.',
      assumptions: 'Nimbus provides a full workload inventory before kickoff.',
      notes:
        'Migration window still pending confirmation from Nimbus ops team.',
      pricing: [{ item: 'Migration engineering', amount: '$65,000' }],
    },
    revisions: [
      {
        id: 'sow-1050-r1',
        version: 1,
        submittedAt: null,
        status: 'draft',
        workflowInstanceSteps: [],
      },
    ],
  },
  {
    id: 'sow-1031',
    number: 'SOW-1031',
    title: 'Warehouse Logistics Rollout - Batch 1',
    clientId: 'client-2',
    clientName: 'Cobalt Freight Systems',
    projectId: 'proj-2',
    projectName: 'Warehouse Logistics Rollout',
    status: 'approved',
    version: 1,
    updatedAt: '2026-05-04',
    creator: 'Marcus Yee',
    workflowTemplateName: 'Finance Approval',
    sections: {
      objectives: 'Roll out logistics tracking software to Batch 1 warehouses.',
      scope: 'Deployment across 5 warehouses with barcode scanner integration.',
      deliverables: [
        'Scanner integration',
        'Warehouse staff training',
        'Go-live support',
      ],
      milestones: [{ name: 'Batch 1 go-live', dueDate: '2026-05-15' }],
      periodStart: '2026-04-01',
      periodEnd: '2026-05-31',
      acceptanceCriteria:
        'All 5 warehouses scanning and syncing inventory in real time.',
      dependencies: 'Hardware delivery of barcode scanners by 2026-04-10.',
      risks: 'Warehouse staff training availability during peak season.',
      assumptions: 'Cobalt provides warehouse floor access for installation.',
      notes: 'Batch 2 rollout scope to be defined in a follow-on SOW.',
      pricing: [{ item: 'Implementation', amount: '$48,000' }],
    },
    revisions: [
      {
        id: 'sow-1031-r1',
        version: 1,
        submittedAt: '2026-04-20',
        status: 'approved',
        workflowInstanceSteps: [
          {
            id: 'wis6',
            name: 'Finance Review',
            actor: 'Ravi Kapoor',
            status: 'approved',
            decidedAt: '2026-04-25 09:00',
          },
          {
            id: 'wis7',
            name: 'Controller Approval',
            actor: 'Dana Whitfield',
            status: 'approved',
            decidedAt: '2026-05-04 12:00',
          },
        ],
      },
    ],
  },
  {
    id: 'sow-1027',
    number: 'SOW-1027',
    title: 'Facilities Analytics Pilot - Sensor Rollout',
    clientId: 'client-4',
    clientName: 'Palmetto Energy LLC',
    projectId: 'proj-4',
    projectName: 'Facilities Analytics Pilot',
    status: 'rejected',
    version: 1,
    updatedAt: '2026-03-19',
    creator: 'Talia Brooks',
    workflowTemplateName: 'Standard Workflow',
    sections: {
      objectives:
        'Deploy IoT sensors across two facilities for a 90-day analytics pilot.',
      scope: 'Sensor install, edge gateway config, and dashboard rollout.',
      deliverables: ['Sensor install', 'Analytics dashboard'],
      milestones: [{ name: 'Sensor install complete', dueDate: '2026-04-01' }],
      periodStart: '2026-03-01',
      periodEnd: '2026-06-01',
      acceptanceCriteria:
        'Dashboards reporting live data from both facilities.',
      dependencies: 'Facility access windows approved by Palmetto safety team.',
      risks: 'Budget exceeds pilot program cap.',
      assumptions: 'Palmetto covers sensor hardware costs separately.',
      notes: 'Resubmission should include a revised budget breakdown.',
      pricing: [{ item: 'Pilot engineering', amount: '$31,000' }],
    },
    revisions: [
      {
        id: 'sow-1027-r1',
        version: 1,
        submittedAt: '2026-03-10',
        status: 'rejected',
        workflowInstanceSteps: [
          {
            id: 'wis8',
            name: 'Manager Review',
            actor: 'Dana Whitfield',
            status: 'rejected',
            comment:
              'Budget exceeds pilot program cap - resubmit with revised scope.',
            decidedAt: '2026-03-19 11:30',
          },
        ],
      },
    ],
  },
];

export function getSow(id: string) {
  return sows.find((s) => s.id === id);
}

export function createSow(input: {
  title: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  creator: string;
  templateName?: string;
  documentHtml?: string;
}): Sow {
  const today = new Date().toISOString().slice(0, 10);
  const number = `SOW-${1000 + sows.length + 1}`;
  const sow: Sow = {
    id: `sow-${Date.now()}`,
    number,
    title: input.title,
    clientId: input.clientId,
    clientName: input.clientName,
    projectId: input.projectId,
    projectName: input.projectName,
    status: 'draft',
    version: 1,
    updatedAt: today,
    creator: input.creator,
    workflowTemplateName: 'Standard Workflow',
    sections: {
      objectives: '',
      scope: '',
      deliverables: [],
      milestones: [],
      periodStart: '',
      periodEnd: '',
      acceptanceCriteria: '',
      dependencies: '',
      risks: '',
      assumptions: '',
      notes: '',
      pricing: [],
    },
    revisions: [
      {
        id: `${number}-r1`,
        version: 1,
        submittedAt: null,
        status: 'draft',
        workflowInstanceSteps: [],
      },
    ],
    templateName: input.templateName,
    documentHtml: input.documentHtml,
  };
  sows.push(sow);
  return sow;
}

export const sowStatusLabels: Record<SowStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
  archived: 'Archived',
};
