'use client';

import { useMemo, useState } from 'react';
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@sow-platform/ui';
import { PageHeader } from '@/components/shared/page-header';
import { auditLogs } from '@/lib/data/audit-logs';

const entityTypes = [
  'all',
  'SOW',
  'Client',
  'Project',
  'Template',
  'Workflow',
  'User',
] as const;

export default function TenantAuditPage() {
  const [entityType, setEntityType] =
    useState<(typeof entityTypes)[number]>('all');

  const filtered = useMemo(
    () =>
      entityType === 'all'
        ? auditLogs
        : auditLogs.filter((a) => a.entityType === entityType),
    [entityType],
  );

  return (
    <div>
      <PageHeader
        title="Audit Log"
        description="Append-only. Every state-changing action creates an immutable entry."
      />

      <div className="mb-4">
        <Select
          value={entityType}
          onValueChange={(v) => setEntityType(v as typeof entityType)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            {entityTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t === 'all' ? 'All entity types' : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Actor</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.actor}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="mr-2">
                    {log.entityType}
                  </Badge>
                  {log.entityName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.action}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {log.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
