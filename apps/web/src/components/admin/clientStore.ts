import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ClientRow = {
  id: string;
  name: string;
  companyName: string;
  primaryContact?: string;
  email?: string;
  phone?: string;
  projectsCount: number;
  archived: boolean;
  createdAt: string;
};

type ClientStore = {
  clients: ClientRow[];
  addClient: (client: ClientRow) => void;
  updateClient: (id: string, patch: Partial<ClientRow>) => void;
  archiveClient: (id: string) => void;
};

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      clients: [],
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, patch) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      archiveClient: (id) =>
        set((state) => ({
          clients: state.clients.map((c) => (c.id === id ? { ...c, archived: true } : c)),
        })),
    }),
    { name: 'client-store' }
  )
);
