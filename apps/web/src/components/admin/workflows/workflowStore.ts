import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Step } from '@sow/workflows';

export type SowLink = {
  id: string;
  sowNumber: string;
  title: string;
  /** Mock progress: index of the step currently in review (steps.length = fully approved). Independent per SOW. */
  currentStep: number;
};

export type WorkflowStatus = 'PUBLISHED' | 'DRAFT';

export type WorkflowRow = {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  steps: Step[];
  /** A workflow can be reused across multiple SOWs, each progressing through it independently. */
  sows: SowLink[];
};

const SEED_WORKFLOWS: WorkflowRow[] = [
  {
    id: 'w-1',
    name: 'Standard 2-step',
    description: 'Manager review, then finance sign-off.',
    status: 'PUBLISHED',
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
    sows: [
      {
        id: 's-1',
        sowNumber: 'SOW-1042',
        title: 'Website revamp — Phase 1',
        currentStep: 2,
      },
      {
        id: 's-4',
        sowNumber: 'SOW-1048',
        title: 'Phase 2 scope addendum',
        currentStep: 0,
      },
    ],
  },
  {
    id: 'w-2',
    name: 'Single approver',
    status: 'DRAFT',
    steps: [
      {
        label: 'Director approval',
        approverIds: ['u-3'],
        matchType: 'AND',
        role: 'APPROVER',
      },
    ],
    sows: [
      {
        id: 's-3',
        sowNumber: 'SOW-1055',
        title: 'Support retainer renewal',
        currentStep: 0,
      },
    ],
  },
  {
    id: 'w-3',
    name: 'Joint sign-off (AND)',
    description: 'Both Dana and Jordan must approve before it moves forward.',
    status: 'PUBLISHED',
    steps: [
      {
        label: 'Joint review',
        approverIds: ['u-3', 'u-4'],
        matchType: 'AND',
        role: 'APPROVER',
      },
    ],
    sows: [
      {
        id: 's-5',
        sowNumber: 'SOW-1060',
        title: 'Joint sign-off demo',
        currentStep: 1,
      },
    ],
  },
  {
    id: 'w-4',
    name: 'Either approver (OR)',
    description:
      'Either Dana or Jordan can approve — whichever is available first.',
    status: 'PUBLISHED',
    steps: [
      {
        label: 'Backup review',
        approverIds: ['u-3', 'u-4'],
        matchType: 'OR',
        role: 'APPROVER',
        approvedBy: ['u-4'],
      },
    ],
    sows: [
      {
        id: 's-6',
        sowNumber: 'SOW-1061',
        title: 'Either approver demo',
        currentStep: 1,
      },
    ],
  },
  {
    id: 'w-5',
    name: 'Mixed conditions (AND + OR)',
    description: 'Joint review requires both, final sign-off accepts either.',
    status: 'PUBLISHED',
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
        approvedBy: ['u-3'],
      },
    ],
    sows: [
      {
        id: 's-7',
        sowNumber: 'SOW-1062',
        title: 'Mixed conditions demo',
        currentStep: 2,
      },
    ],
  },
];

export type WorkflowInput = {
  name: string;
  description?: string;
  steps: Step[];
};

type WorkflowStore = {
  workflows: WorkflowRow[];
  addWorkflow: (input: WorkflowInput) => WorkflowRow;
  updateWorkflow: (id: string, input: WorkflowInput) => void;
  deleteWorkflow: (id: string) => void;
  publishWorkflow: (id: string) => void;
};

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set) => ({
      workflows: SEED_WORKFLOWS,

      addWorkflow: (input) => {
        const row: WorkflowRow = {
          id: `w-${Date.now()}`,
          name: input.name,
          description: input.description,
          status: 'DRAFT',
          steps: input.steps,
          sows: [],
        };
        set((state) => ({ workflows: [...state.workflows, row] }));
        return row;
      },

      updateWorkflow: (id, input) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id
              ? {
                  ...w,
                  name: input.name,
                  description: input.description,
                  steps: input.steps,
                }
              : w,
          ),
        }));
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter((w) => w.id !== id),
        }));
      },

      publishWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === id ? { ...w, status: 'PUBLISHED' } : w,
          ),
        }));
      },
    }),
    { name: 'sow-workflow-store' },
  ),
);
