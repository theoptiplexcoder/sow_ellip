import type { FieldDraft } from './builder/fieldTypes';
import type { SchemaOverride } from './templateStore';

export type SowStatus = 'DRAFT' | 'PUBLISHED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'IN_REVIEW';

export type SowRow = {
  id: string;
  sowNumber: string;
  title: string;
  project: string;
  status: SowStatus;
  version: number;
  updatedAt: string;
  description: string;
  templateId: string;
  awaitingApproval?: boolean;
  formData?: Record<string, unknown>;
  fields?: FieldDraft[];
  schemaOverride?: SchemaOverride | null;
};

export const ADMIN_SOWS: SowRow[] = [];
