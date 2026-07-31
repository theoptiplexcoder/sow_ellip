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

export const useTeamStore = create<TeamStore>()(
  persist(
    (set) => ({
      members: [],
      addMember: (member) => set((state) => ({ members: [...state.members, member] })),
      removeMember: (id) => set((state) => ({ members: state.members.filter((m) => m.id !== id) })),
    }),
    { name: 'team-store' }
  )
);
