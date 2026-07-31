import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Status = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ProjectRow = {
  id: string;
  name: string;
  clientId: string;
  ownerId: string;
  status: Status;
  startDate?: string;
  endDate?: string;
};

export type RequirementComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

type ProjectStore = {
  projects: ProjectRow[];
  comments: Record<string, RequirementComment[]>;
  addProject: (project: ProjectRow) => void;
  updateProject: (id: string, patch: Partial<ProjectRow>) => void;
  addComment: (projectId: string, comment: RequirementComment) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      comments: {},
      addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
      updateProject: (id, patch) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      addComment: (projectId, comment) =>
        set((state) => ({
          comments: {
            ...state.comments,
            [projectId]: [...(state.comments[projectId] || []), comment],
          },
        })),
    }),
    { name: 'project-store' }
  )
);
