import { ProjectRole } from './users';

export interface ProjectMember {
  userId: string;
  roles: ProjectRole[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  owner: string;
  status: 'active' | 'on_hold' | 'completed';
  sowCount: number;
  members: ProjectMember[];
  files: { id: string; name: string; uploadedAt: string }[];
  description?: string;
  startDate?: string;
  deadline?: string;
  requirements?: string[];
}

export const projects: Project[] = [
  {
    id: 'proj-1',
    name: 'Storefront Modernization Phase 2',
    clientId: 'client-1',
    clientName: 'Harborline Retail Co.',
    owner: 'Casey Odom',
    status: 'active',
    sowCount: 3,
    members: [
      { userId: 'user-2', roles: ['creator'] },
      { userId: 'user-1', roles: ['approver'] },
      { userId: 'user-6', roles: ['approver'] },
      { userId: 'user-5', roles: ['executive_viewer'] },
    ],
    files: [{ id: 'f1', name: 'Site Survey.pdf', uploadedAt: '2026-02-01' }],
    description:
      "Redesign and rebuild the digital storefront experience across Harborline's retail locations, including POS integration and a refreshed loyalty program.",
    startDate: '2026-01-15',
    deadline: '2026-09-30',
    requirements: [
      'POS system integrated with new inventory backend',
      'Loyalty program migrated without data loss',
      'Accessibility audit passed (WCAG 2.1 AA)',
      'Staff training materials delivered',
    ],
  },
  {
    id: 'proj-2',
    name: 'Warehouse Logistics Rollout',
    clientId: 'client-2',
    clientName: 'Cobalt Freight Systems',
    owner: 'Marcus Yee',
    status: 'active',
    sowCount: 2,
    members: [
      { userId: 'user-4', roles: ['creator', 'approver'] },
      { userId: 'user-1', roles: ['approver'] },
      { userId: 'user-8', roles: ['creator'] },
    ],
    files: [],
    description:
      "Modernize warehouse routing and fleet dispatch software for Cobalt's three regional distribution centers.",
    startDate: '2026-03-01',
    deadline: '2026-08-20',
    requirements: [
      'Real-time fleet tracking dashboard',
      'Automated dispatch routing engine',
      'Integration with existing WMS',
    ],
  },
  {
    id: 'proj-3',
    name: 'Patient Portal Integration',
    clientId: 'client-3',
    clientName: 'Meridian Health Partners',
    owner: 'Dana Whitfield',
    status: 'active',
    sowCount: 5,
    members: [
      { userId: 'user-1', roles: ['approver', 'executive_viewer'] },
      { userId: 'user-3', roles: ['creator'] },
      { userId: 'user-6', roles: ['approver'] },
      { userId: 'user-7', roles: ['creator'] },
    ],
    files: [
      {
        id: 'f2',
        name: 'HIPAA Compliance Checklist.pdf',
        uploadedAt: '2026-01-20',
      },
      { id: 'f3', name: 'Integration Diagram.png', uploadedAt: '2026-02-11' },
    ],
    description:
      'Build a secure patient-facing portal for Meridian Health Partners, integrating appointment scheduling and records access with the existing EHR system.',
    startDate: '2025-11-10',
    deadline: '2026-08-15',
    requirements: [
      'HIPAA compliance sign-off',
      'EHR integration (HL7/FHIR)',
      'Multi-factor authentication for patient login',
      'Appointment scheduling with provider calendars',
      'Accessibility audit passed (WCAG 2.1 AA)',
    ],
  },
  {
    id: 'proj-4',
    name: 'Facilities Analytics Pilot',
    clientId: 'client-4',
    clientName: 'Palmetto Energy LLC',
    owner: 'Talia Brooks',
    status: 'on_hold',
    sowCount: 1,
    members: [
      { userId: 'user-5', roles: ['creator'] },
      { userId: 'user-1', roles: ['approver'] },
    ],
    files: [],
    description:
      'Pilot an energy-usage analytics dashboard across two Palmetto facilities, currently paused pending budget approval.',
    startDate: '2026-02-01',
    deadline: '2026-11-01',
    requirements: [
      'Sensor data pipeline validated',
      'Budget approval from facilities leadership',
    ],
  },
  {
    id: 'proj-5',
    name: 'Cloud Migration Wave 1',
    clientId: 'client-5',
    clientName: 'Nimbus Cloud Ventures',
    owner: 'Ravi Kapoor',
    status: 'active',
    sowCount: 4,
    members: [
      { userId: 'user-6', roles: ['creator'] },
      { userId: 'user-4', roles: ['approver'] },
      { userId: 'user-1', roles: ['approver'] },
      { userId: 'user-5', roles: ['executive_viewer'] },
    ],
    files: [
      { id: 'f4', name: 'Migration Runbook.docx', uploadedAt: '2026-05-02' },
    ],
    description:
      "First wave of Nimbus Cloud Ventures' migration off legacy on-prem infrastructure — core services and databases.",
    startDate: '2026-04-01',
    deadline: '2026-09-01',
    requirements: [
      'Zero-downtime database cutover plan',
      'Core services containerized',
      'Rollback plan documented and tested',
    ],
  },
  {
    id: 'proj-6',
    name: 'Cloud Migration Wave 2',
    clientId: 'client-5',
    clientName: 'Nimbus Cloud Ventures',
    owner: 'Ravi Kapoor',
    status: 'completed',
    sowCount: 2,
    members: [
      { userId: 'user-6', roles: ['creator'] },
      { userId: 'user-1', roles: ['approver'] },
    ],
    files: [],
    description:
      "Second and final wave of Nimbus Cloud Ventures' cloud migration, covering remaining edge services. Completed on schedule.",
    startDate: '2026-01-05',
    deadline: '2026-04-30',
    requirements: [
      'Edge services migrated',
      'Legacy infrastructure decommissioned',
      'Post-migration cost audit',
    ],
  },
];

export function getProject(id: string) {
  return projects.find((p) => p.id === id);
}

export function updateProjectMembers(
  projectId: string,
  members: ProjectMember[],
) {
  const project = getProject(projectId);
  if (!project) return;
  project.members = members;
}

export function getProjectsForUser(userId: string, role?: ProjectRole) {
  return projects.filter((p) =>
    p.members.some(
      (m) => m.userId === userId && (!role || m.roles.includes(role)),
    ),
  );
}

export function createProject(input: {
  name: string;
  clientId: string;
  clientName: string;
  ownerId: string;
  ownerName: string;
}): Project {
  const project: Project = {
    id: `proj-${Date.now()}`,
    name: input.name,
    clientId: input.clientId,
    clientName: input.clientName,
    owner: input.ownerName,
    status: 'active',
    sowCount: 0,
    members: [{ userId: input.ownerId, roles: ['creator'] }],
    files: [],
  };
  projects.push(project);
  return project;
}
