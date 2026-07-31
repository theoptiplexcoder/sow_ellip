import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { JSONContent } from '@tiptap/core';
import type { FieldDraft } from '../admin/sows/builder/fieldTypes';
import type { SchemaOverride } from '../admin/sows/templateStore';
import { recordVersion } from '../admin/sows/sowVersionHistory';
import { PARTICIPANT_SOWS, type SowRow, type SowStatus } from './participantSowData';

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
  body?: JSONContent;
};

type ParticipantSowStore = {
  sows: SowRow[];
  addSow: (input: SowInput) => SowRow;
  setStatus: (id: string, status: SowStatus) => void;
  updateSow: (id: string, patch: SowUpdateInput) => void;
  saveNewVersion: (id: string, input: SowVersionInput) => void;
};

export const useParticipantSowStore = create<ParticipantSowStore>()(
  persist(
    (set) => ({
      sows: PARTICIPANT_SOWS,

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
          updatedBy: 'Participant',
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
        set((state) => ({
          sows: state.sows.map((s) =>
            s.id === id
              ? {
                  ...s,
                  fields: input.fields,
                  schemaOverride: input.schemaOverride,
                  formData: input.formData,
                  body: input.body ?? s.body,
                  version: s.version + 1,
                  updatedAt: new Date().toISOString().slice(0, 10),
                }
              : s,
          ),
        }));
      },
    }),
    { name: 'sow-participant-sow-store-v4' },
  ),
);
