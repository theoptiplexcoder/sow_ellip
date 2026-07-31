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
const MOCK_PROJECTS: ProjectRow[] = [
  {
    id: 'p-1',
    name: 'Website Redesign',
    clientId: 'c-1',
    ownerId: 'u-1',
    status: 'ACTIVE',
    startDate: '2026-06-01',
    endDate: '2026-10-31',
  },
  {
    id: 'p-2',
    name: 'Mobile App Development',
    clientId: 'c-1',
    ownerId: 'u-2',
    status: 'ON_HOLD',
    startDate: '2026-03-15',
  },
  {
    id: 'p-3',
    name: 'Cloud Migration',
    clientId: 'c-2',
    ownerId: 'u-3',
    status: 'ACTIVE',
    startDate: '2026-07-01',
    endDate: '2026-12-15',
  },
];

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: MOCK_PROJECTS,
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
    { name: 'project-store-v2' }
  )
);
