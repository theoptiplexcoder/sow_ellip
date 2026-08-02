export type ApprovalLogic = 'ALL' | 'ANY';

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  approverUserIds: string[];
  /** How multiple participants on this step resolve approval: ALL = AND (every participant must approve), ANY = OR (one approval suffices). */
  approvalLogic: ApprovalLogic;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'archived';
  updatedAt: string;
  steps: WorkflowStep[];
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'wf-1',
    name: 'Standard Workflow',
    status: 'active',
    updatedAt: '2026-05-14',
    steps: [
      {
        id: 'wf1-s1',
        order: 1,
        name: 'Manager Review',
        approverUserIds: ['user-1'],
        approvalLogic: 'ALL',
      },
      {
        id: 'wf1-s2',
        order: 2,
        name: 'Finance Sign-off',
        approverUserIds: ['user-6', 'user-2'],
        approvalLogic: 'ANY',
      },
    ],
  },
  {
    id: 'wf-2',
    name: 'Finance Approval',
    status: 'active',
    updatedAt: '2026-04-02',
    steps: [
      {
        id: 'wf2-s1',
        order: 1,
        name: 'Finance Review',
        approverUserIds: ['user-6'],
        approvalLogic: 'ALL',
      },
      {
        id: 'wf2-s2',
        order: 2,
        name: 'Controller Approval',
        approverUserIds: ['user-1'],
        approvalLogic: 'ALL',
      },
    ],
  },
  {
    id: 'wf-3',
    name: '3-Step Legal Review',
    status: 'active',
    updatedAt: '2026-06-21',
    steps: [
      {
        id: 'wf3-s1',
        order: 1,
        name: 'Legal Intake',
        approverUserIds: ['user-4', 'user-3'],
        approvalLogic: 'ALL',
      },
      {
        id: 'wf3-s2',
        order: 2,
        name: 'Compliance Review',
        approverUserIds: ['user-1'],
        approvalLogic: 'ALL',
      },
      {
        id: 'wf3-s3',
        order: 3,
        name: 'Executive Sign-off',
        approverUserIds: ['user-6'],
        approvalLogic: 'ALL',
      },
    ],
  },
  {
    id: 'wf-4',
    name: 'Fast-Track Internal',
    status: 'inactive',
    updatedAt: '2026-01-30',
    steps: [
      {
        id: 'wf4-s1',
        order: 1,
        name: 'Manager Review',
        approverUserIds: ['user-1'],
        approvalLogic: 'ALL',
      },
    ],
  },
];

export function getWorkflowTemplate(id: string) {
  return workflowTemplates.find((w) => w.id === id);
}
