import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Member = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  createdAt: string;
};

type TeamStore = {
  members: Member[];
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
};
const MOCK_MEMBERS: Member[] = [
  {
    id: 'u-1',
    employeeId: 'EMP-001',
    name: 'Alice Smith',
    email: 'alice@organization.com',
    designation: 'Software Engineer',
    createdAt: '2026-01-10',
  },
  {
    id: 'u-2',
    employeeId: 'EMP-002',
    name: 'Bob Jones',
    email: 'bob@organization.com',
    designation: 'Product Manager',
    createdAt: '2026-02-15',
  },
  {
    id: 'u-3',
    employeeId: 'EMP-003',
    name: 'Dana Scully',
    email: 'dana@organization.com',
    designation: 'Director of Engineering',
    createdAt: '2026-03-01',
  },
  {
    id: 'u-4',
    employeeId: 'EMP-004',
    name: 'Jordan Lee',
    email: 'jordan@organization.com',
    designation: 'Finance Manager',
    createdAt: '2026-03-10',
  },
];

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      members: MOCK_MEMBERS,
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
    }),
    { name: 'team-store-v2' }
  )
);
