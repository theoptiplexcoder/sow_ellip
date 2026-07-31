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
const MOCK_CLIENTS: ClientRow[] = [
  {
    id: 'c-1',
    name: 'Acme Corp',
    companyName: 'Acme Corporation',
    primaryContact: 'John Doe',
    email: 'john.doe@acme.com',
    phone: '+1 (555) 123-4567',
    projectsCount: 3,
    archived: false,
    createdAt: '2026-01-05',
  },
  {
    id: 'c-2',
    name: 'Globex',
    companyName: 'Globex Inc.',
    primaryContact: 'Jane Smith',
    email: 'jane.smith@globex.com',
    phone: '+1 (555) 987-6543',
    projectsCount: 1,
    archived: false,
    createdAt: '2026-02-12',
  },
  {
    id: 'c-3',
    name: 'Initech',
    companyName: 'Initech LLC',
    primaryContact: 'Peter Gibbons',
    email: 'peter.g@initech.com',
    phone: '+1 (555) 555-0199',
    projectsCount: 0,
    archived: true,
    createdAt: '2026-04-20',
  },
];

export const useClientStore = create<ClientStore>()(
  persist(
    (set) => ({
      clients: MOCK_CLIENTS,
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
    { name: 'client-store-v2' }
  )
);
