export interface Client {
  id: string;
  company: string;
  owner: string;
  projectCount: number;
  createdAt: string;
  status: 'active' | 'inactive';
  contacts: { id: string; name: string; email: string; title: string }[];
  documents: { id: string; name: string; uploadedAt: string }[];
}

export const clients: Client[] = [
  {
    id: 'client-1',
    company: 'Harborline Retail Co.',
    owner: 'Casey Odom',
    projectCount: 3,
    createdAt: '2025-11-20',
    status: 'active',
    contacts: [
      {
        id: 'c1-1',
        name: 'Wendy Fischer',
        email: 'wendy@harborline.com',
        title: 'VP Operations',
      },
      {
        id: 'c1-2',
        name: 'Neil Ambrose',
        email: 'neil@harborline.com',
        title: 'Procurement Lead',
      },
    ],
    documents: [
      {
        id: 'c1-doc-1',
        name: 'MSA - Harborline.pdf',
        uploadedAt: '2025-11-21',
      },
    ],
  },
  {
    id: 'client-2',
    company: 'Cobalt Freight Systems',
    owner: 'Marcus Yee',
    projectCount: 2,
    createdAt: '2025-12-02',
    status: 'active',
    contacts: [
      {
        id: 'c2-1',
        name: 'Grace Tanaka',
        email: 'grace@cobaltfreight.com',
        title: 'Director of IT',
      },
    ],
    documents: [],
  },
  {
    id: 'client-3',
    company: 'Meridian Health Partners',
    owner: 'Dana Whitfield',
    projectCount: 4,
    createdAt: '2026-01-15',
    status: 'active',
    contacts: [
      {
        id: 'c3-1',
        name: 'Dr. Aaron Kessler',
        email: 'akessler@meridianhp.com',
        title: 'CIO',
      },
      {
        id: 'c3-2',
        name: 'Renee Foss',
        email: 'rfoss@meridianhp.com',
        title: 'Program Manager',
      },
    ],
    documents: [
      { id: 'c3-doc-1', name: 'NDA - Meridian.pdf', uploadedAt: '2026-01-16' },
      {
        id: 'c3-doc-2',
        name: 'Vendor Onboarding.docx',
        uploadedAt: '2026-01-18',
      },
    ],
  },
  {
    id: 'client-4',
    company: 'Palmetto Energy LLC',
    owner: 'Talia Brooks',
    projectCount: 1,
    createdAt: '2026-03-05',
    status: 'inactive',
    contacts: [
      {
        id: 'c4-1',
        name: 'Ben Castillo',
        email: 'ben@palmettoenergy.com',
        title: 'Facilities Manager',
      },
    ],
    documents: [],
  },
  {
    id: 'client-5',
    company: 'Nimbus Cloud Ventures',
    owner: 'Ravi Kapoor',
    projectCount: 2,
    createdAt: '2026-04-22',
    status: 'active',
    contacts: [
      {
        id: 'c5-1',
        name: 'Sofia Petrov',
        email: 'sofia@nimbuscloud.io',
        title: 'Head of Engineering',
      },
    ],
    documents: [
      {
        id: 'c5-doc-1',
        name: 'Master Services Agreement.pdf',
        uploadedAt: '2026-04-23',
      },
    ],
  },
];

export function getClient(id: string) {
  return clients.find((c) => c.id === id);
}
