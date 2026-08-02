export interface AuditLogEntry {
  id: string;
  actor: string;
  entityType: 'SOW' | 'Client' | 'Project' | 'Template' | 'Workflow' | 'User';
  entityName: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export const auditLogs: AuditLogEntry[] = [
  {
    id: 'a1',
    actor: 'Casey Odom',
    entityType: 'SOW',
    entityName: 'SOW-1042 Storefront Rollout',
    action: 'submitted',
    timestamp: '2026-07-30 14:02',
    metadata: { from: 'Draft', to: 'Submitted' },
  },
  {
    id: 'a2',
    actor: 'Dana Whitfield',
    entityType: 'SOW',
    entityName: 'SOW-1042 Storefront Rollout',
    action: 'approved (step 1)',
    timestamp: '2026-07-30 15:11',
    metadata: { step: 'Manager Review' },
  },
  {
    id: 'a3',
    actor: 'Marcus Yee',
    entityType: 'Client',
    entityName: 'Cobalt Freight Systems',
    action: 'updated',
    timestamp: '2026-07-29 09:45',
  },
  {
    id: 'a4',
    actor: 'Dana Whitfield',
    entityType: 'Template',
    entityName: 'Standard Professional Services SOW',
    action: 'version published (v4)',
    timestamp: '2026-06-02 11:20',
  },
  {
    id: 'a5',
    actor: 'Priya Shah',
    entityType: 'SOW',
    entityName: 'SOW-1039 Patient Portal API',
    action: 'changes requested',
    timestamp: '2026-07-28 10:05',
    metadata: { reason: 'Pricing table incomplete' },
  },
  {
    id: 'a6',
    actor: 'Talia Brooks',
    entityType: 'Project',
    entityName: 'Facilities Analytics Pilot',
    action: 'created',
    timestamp: '2026-07-20 08:30',
  },
  {
    id: 'a7',
    actor: 'Dana Whitfield',
    entityType: 'Workflow',
    entityName: '3-Step Legal Review',
    action: 'activated',
    timestamp: '2026-06-21 13:44',
  },
  {
    id: 'a8',
    actor: 'Dana Whitfield',
    entityType: 'User',
    entityName: 'Emma Lindqvist',
    action: 'deactivated',
    timestamp: '2026-06-15 09:02',
  },
  {
    id: 'a9',
    actor: 'Ravi Kapoor',
    entityType: 'SOW',
    entityName: 'SOW-1050 Cloud Migration Wave 1',
    action: 'created',
    timestamp: '2026-07-15 16:40',
  },
  {
    id: 'a10',
    actor: 'Marcus Yee',
    entityType: 'SOW',
    entityName: 'SOW-1031 Warehouse Logistics',
    action: 'approved (final)',
    timestamp: '2026-05-04 12:00',
    metadata: { status: 'Approved' },
  },
];
