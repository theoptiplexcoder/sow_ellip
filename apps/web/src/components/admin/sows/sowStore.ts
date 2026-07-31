import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FieldDraft } from './builder/fieldTypes';
import type { SchemaOverride } from './templateStore';
import { ADMIN_SOWS, type SowRow, type SowStatus } from './sowData';
import { diffFormData, recordVersion } from './sowVersionHistory';

export type { SowRow, SowStatus };

export type SowInput = {
  title: string;
  project: string;
  description: string;
  templateId: string;
  formData?: Record<string, unknown>;
};

export type SowUpdateInput = Partial<Pick<SowRow, 'title' | 'project' | 'description' | 'formData'>>;

export type SowVersionInput = {
  fields: FieldDraft[];
  schemaOverride: SchemaOverride | null;
  formData: Record<string, unknown>;
};

type SowStore = {
  sows: SowRow[];
  addSow: (input: SowInput) => SowRow;
  setStatus: (id: string, status: SowStatus) => void;
  updateSow: (id: string, patch: SowUpdateInput) => void;
  saveNewVersion: (id: string, input: SowVersionInput) => void;
};

export const useSowStore = create<SowStore>()(
  persist(
    (set) => ({
      sows: ADMIN_SOWS,

      addSow: (input) => {
        const now = Date.now();
        const row: SowRow = {
          id: `s-${now}`,
          sowNumber: `SOW-${now.toString().slice(-4)}`,
          title: input.title,
          project: input.project,
          status: 'DRAFT',
          version: 1,
          updatedAt: new Date().toISOString().slice(0, 10),
          description: input.description,
          templateId: input.templateId,
          formData: input.formData ?? {},
        };
        recordVersion(row.id, {
          version: 1,
          updatedAt: row.updatedAt,
          updatedBy: 'Admin',
          changes: [],
        });
        set((state) => ({ sows: [...state.sows, row] }));
        return row;
      },

      setStatus: (id, status) => {
        set((state) => ({
          sows: state.sows.map((s) => (s.id === id ? { ...s, status } : s)),
        }));
      },

      updateSow: (id, patch) => {
        set((state) => ({
          sows: state.sows.map((s) =>
            s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : s,
          ),
        }));
      },

      saveNewVersion: (id, input) => {
        set((state) => {
          const current = state.sows.find((s) => s.id === id);
          if (!current) return state;
          const nextVersion = current.version + 1;
          recordVersion(id, {
            version: nextVersion,
            updatedAt: new Date().toISOString().slice(0, 10),
            updatedBy: 'Admin',
            changes: diffFormData(input.fields, current.formData ?? {}, input.formData),
          });
          return {
            sows: state.sows.map((s) =>
              s.id === id
                ? {
                    ...s,
                    fields: input.fields,
                    schemaOverride: input.schemaOverride,
                    formData: input.formData,
                    version: nextVersion,
                    updatedAt: new Date().toISOString().slice(0, 10),
                  }
                : s,
            ),
          };
        });
      },
    }),
    { name: 'sow-sow-store-v2' },
  ),
);
