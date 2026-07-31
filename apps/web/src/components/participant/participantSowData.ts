import type { FieldDraft } from '../admin/sows/builder/fieldTypes';
import type { SchemaOverride } from '../admin/sows/templateStore';

export type SowStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'REJECTED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REQUIRES_APPROVAL';

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

export const PARTICIPANT_SOWS: SowRow[] = [];
