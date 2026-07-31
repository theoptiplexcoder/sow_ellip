import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FieldDraft } from '../admin/sows/builder/fieldTypes';
import type { SchemaOverride } from '../admin/sows/templateStore';
import { PARTICIPANT_SOWS, type SowRow, type SowStatus } from './participantSowData';

export type { SowRow, SowStatus };

export type SowUpdateInput = Partial<Pick<SowRow, 'title' | 'project' | 'description' | 'formData'>>;

export type SowVersionInput = {
  fields: FieldDraft[];
  schemaOverride: SchemaOverride | null;
  formData: Record<string, unknown>;
};

type ParticipantSowStore = {
  sows: SowRow[];
  setStatus: (id: string, status: SowStatus) => void;
  updateSow: (id: string, patch: SowUpdateInput) => void;
  saveNewVersion: (id: string, input: SowVersionInput) => void;
};

export const useParticipantSowStore = create<ParticipantSowStore>()(
  persist(
    (set) => ({
      sows: PARTICIPANT_SOWS,

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
                  version: s.version + 1,
                  updatedAt: new Date().toISOString().slice(0, 10),
                }
              : s,
          ),
        }));
      },
    }),
    { name: 'sow-participant-sow-store-v2' },
  ),
);
