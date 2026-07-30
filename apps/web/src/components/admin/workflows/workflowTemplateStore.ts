import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Step } from '@sow/workflows';

export type WorkflowTemplateRow = {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  ownerId: string;
  ownerName: string;
};

/** Templates created from the admin Workflow Yard are attributed to the org, not a specific person. */
export const ORG_OWNER_ID = 'u-1';
export const ORG_OWNER_NAME = 'Priya Nair';

const SEED_TEMPLATES: WorkflowTemplateRow[] = [
  {
    id: 't-1',
    name: 'Standard SOW Approval',
    description: 'General 2-step approval for standard Statements of Work.',
    steps: [
      {
        label: 'Manager review',
        approverIds: ['u-3'],
        matchType: 'AND',
        role: 'APPROVER',
      },
      {
        label: 'Finance sign-off',
        approverIds: ['u-4'],
        matchType: 'AND',
        role: 'VIEWER',
      },
    ],
    ownerId: ORG_OWNER_ID,
    ownerName: ORG_OWNER_NAME,
  },
  {
    id: 't-2',
    name: 'Quick Approval',
    description: 'Fast track single-step approval.',
    steps: [
      {
        label: 'Director approval',
        approverIds: ['u-3'],
        matchType: 'AND',
        role: 'APPROVER',
      },
    ],
    ownerId: ORG_OWNER_ID,
    ownerName: ORG_OWNER_NAME,
  },
  {
    id: 't-3',
    name: 'Joint sign-off (AND)',
    description: 'Both Dana and Jordan must approve before it moves forward.',
    steps: [
      {
        label: 'Joint review',
        approverIds: ['u-3', 'u-4'],
        matchType: 'AND',
        role: 'APPROVER',
      },
    ],
    ownerId: ORG_OWNER_ID,
    ownerName: ORG_OWNER_NAME,
  },
  {
    id: 't-4',
    name: 'Either approver (OR)',
    description:
      'Either Dana or Jordan can approve — whichever is available first.',
    steps: [
      {
        label: 'Backup review',
        approverIds: ['u-3', 'u-4'],
        matchType: 'OR',
        role: 'APPROVER',
      },
    ],
    ownerId: ORG_OWNER_ID,
    ownerName: ORG_OWNER_NAME,
  },
  {
    id: 't-5',
    name: 'Mixed conditions (AND + OR)',
    description: 'Joint review requires both, final sign-off accepts either.',
    steps: [
      {
        label: 'Joint review',
        approverIds: ['u-3', 'u-4'],
        matchType: 'AND',
        role: 'APPROVER',
      },
      {
        label: 'Final sign-off',
        approverIds: ['u-3', 'u-4'],
        matchType: 'OR',
        role: 'APPROVER',
      },
    ],
    ownerId: ORG_OWNER_ID,
    ownerName: ORG_OWNER_NAME,
  },
  {
    id: 't-6',
    name: 'Retainer fast-track',
    description: 'My go-to for small recurring retainer renewals.',
    steps: [
      {
        label: 'Client sign-off',
        approverIds: ['u-4'],
        matchType: 'AND',
        role: 'APPROVER',
      },
    ],
    ownerId: 'u-2',
    ownerName: 'Sam Okafor',
  },
];

export type WorkflowTemplateInput = {
  name: string;
  description?: string;
  steps: Step[];
  ownerId: string;
  ownerName: string;
};

type WorkflowTemplateStore = {
  templates: WorkflowTemplateRow[];
  addTemplate: (input: WorkflowTemplateInput) => WorkflowTemplateRow;
  updateTemplate: (
    id: string,
    input: Pick<WorkflowTemplateInput, 'name' | 'description' | 'steps'>,
  ) => void;
  deleteTemplate: (id: string) => void;
};

export const useWorkflowTemplateStore = create<WorkflowTemplateStore>()(
  persist(
    (set) => ({
      templates: SEED_TEMPLATES,

      addTemplate: (input) => {
        const row: WorkflowTemplateRow = { id: `t-${Date.now()}`, ...input };
        set((state) => ({ templates: [...state.templates, row] }));
        return row;
      },

      updateTemplate: (id, input) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...input } : t,
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },
    }),
    { name: 'sow-workflow-template-store' },
  ),
);
