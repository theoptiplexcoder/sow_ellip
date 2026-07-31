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

const SEED_WORKFLOWS: WorkflowRow[] = [];

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
  attachSow: (workflowId: string, sow: SowLink) => void;
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

      attachSow: (workflowId, sow) => {
        set((state) => ({
          workflows: state.workflows.map((w) =>
            w.id === workflowId && !w.sows.some((s) => s.id === sow.id)
              ? { ...w, sows: [...w.sows, sow] }
              : w,
          ),
        }));
      },
    }),
    { name: 'sow-workflow-store-v2' },
  ),
);
