import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { saveTemplatesToFile } from '../../../actions/saveTemplateAction';
import { SAVED_TEMPLATES } from './savedTemplates';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import type { JSONContent } from '@tiptap/core';
import { buildObjectSchema, draftsToDefaultValues } from './fieldTypes';
import type { FieldDraft } from './types';
import { diffSchemaValues, recordVersion } from './sowVersionHistory';

export type TemplateRow = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  version: number;
  fields: FieldDraft[];
  /** The typed document this template's schema was generated from. */
  body?: JSONContent;
  jsonSchema: RJSFSchema;
  uiSchema: UiSchema;
  defaultValues: Record<string, unknown>;
};

export type SchemaOverride = {
  jsonSchema: RJSFSchema;
  uiSchema: UiSchema;
  defaultValues: Record<string, unknown>;
};

export type TemplateInput = {
  id?: string;
  name: string;
  description?: string;
  fields: FieldDraft[];
  body?: JSONContent;
  isActive: boolean;
  schemaOverride?: SchemaOverride | null;
};

function fromFields(fields: FieldDraft[]) {
  const { schema, uiSchema } = buildObjectSchema(fields);
  return {
    jsonSchema: schema,
    uiSchema,
    defaultValues: draftsToDefaultValues(fields),
  };
}

function computeSchema(
  input: Pick<TemplateInput, 'fields' | 'schemaOverride'>,
) {
  if (input.schemaOverride) {
    return {
      jsonSchema: input.schemaOverride.jsonSchema,
      uiSchema: input.schemaOverride.uiSchema,
      defaultValues: input.schemaOverride.defaultValues,
    };
  }
  return fromFields(input.fields);
}

/** Tiptap doc equality: two documents are the same version iff their content trees match. */
function isSameDoc(a: JSONContent | undefined, b: JSONContent | undefined): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

type SeedTemplate = Pick<
  TemplateRow,
  'id' | 'name' | 'description' | 'isActive' | 'createdAt' | 'fields'
>;

const SEED_INPUT: SeedTemplate[] = [
  {
    id: 't-1',
    name: 'Standard Consulting SOW',
    description: 'General-purpose template for consulting engagements.',
    isActive: true,
    createdAt: '2026-01-10',
    fields: [
      {
        key: 'overview',
        kind: 'textarea',
        title: 'Overview',
        description: 'Summarize the engagement.',
        required: true,
        readOnly: false,
        width: '100',
        default: 'This SOW outlines...',
      },
      {
        key: 'budget',
        kind: 'number',
        title: 'Budget (USD)',
        required: false,
        readOnly: false,
        width: '100',
      },
    ],
  },
  {
    id: 't-2',
    name: 'Fixed-Bid Development',
    description: 'For fixed-price software delivery projects.',
    isActive: true,
    createdAt: '2026-02-14',
    fields: [],
  },
  {
    id: 't-3',
    name: 'Retainer v1',
    description: 'Monthly retainer agreement.',
    isActive: false,
    createdAt: '2026-01-22',
    fields: [],
  },
];

const SEED_TEMPLATES: TemplateRow[] = SAVED_TEMPLATES.length > 0 ? SAVED_TEMPLATES : SEED_INPUT.map((t) => ({
  ...t,
  version: 1,
  ...fromFields(t.fields),
}));

type TemplateStore = {
  templates: TemplateRow[];
  upsertTemplate: (input: TemplateInput) => TemplateRow;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  toggleActive: (id: string) => void;
  importTemplate: (data: {
    name: string;
    description?: string;
    fields: FieldDraft[];
  }) => TemplateRow;
};

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      templates: SEED_TEMPLATES,

      upsertTemplate: (input) => {
        const computed = computeSchema(input);
        let saved: TemplateRow;
        set((state) => {
          if (input.id) {
            const existing = state.templates.find((t) => t.id === input.id);
            const contentChanged = !existing || !isSameDoc(existing.body, input.body);
            const nextVersion = existing && contentChanged ? existing.version + 1 : (existing?.version ?? 1);
            const templates = state.templates.map((t) =>
              t.id === input.id
                ? {
                    ...t,
                    name: input.name,
                    description: input.description,
                    fields: input.fields,
                    body: input.body,
                    isActive: input.isActive,
                    version: nextVersion,
                    ...computed,
                  }
                : t,
            );
            saved = templates.find((t) => t.id === input.id)!;
            if (existing && contentChanged) {
              recordVersion(saved.id, {
                version: nextVersion,
                updatedAt: new Date().toISOString().slice(0, 10),
                updatedBy: 'Admin',
                changes: diffSchemaValues(existing.jsonSchema, existing.defaultValues, computed.jsonSchema, computed.defaultValues),
              });
            }
            return { templates };
          }
          const row: TemplateRow = {
            id: `t-${Date.now()}`,
            name: input.name,
            description: input.description,
            isActive: input.isActive,
            createdAt: new Date().toISOString().slice(0, 10),
            version: 1,
            fields: input.fields,
            body: input.body,
            ...computed,
          };
          saved = row;
          recordVersion(row.id, {
            version: 1,
            updatedAt: row.createdAt,
            updatedBy: 'Admin',
            changes: [],
          });
          return { templates: [...state.templates, row] };
        });
        return saved!;
      },

      duplicateTemplate: (id) => {
        set((state) => {
          const source = state.templates.find((t) => t.id === id);
          if (!source) return state;
          let name = `${source.name} (copy)`;
          let i = 2;
          while (
            state.templates.some(
              (t) => t.name.toLowerCase() === name.toLowerCase(),
            )
          ) {
            name = `${source.name} (copy ${i})`;
            i += 1;
          }
          const clone: TemplateRow = {
            ...source,
            id: `t-${Date.now()}`,
            name,
            version: 1,
            createdAt: new Date().toISOString().slice(0, 10),
          };
          return { templates: [...state.templates, clone] };
        });
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      toggleActive: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, isActive: !t.isActive } : t,
          ),
        }));
      },

      importTemplate: (data) => {
        return get().upsertTemplate({
          name: data.name,
          description: data.description,
          fields: data.fields,
          isActive: true,
        });
      },
    }),
    { name: 'sow-template-store-v2' },
  ),
);

export function getTemplateById(id: string): TemplateRow | undefined {
  return useTemplateStore.getState().templates.find((t) => t.id === id);
}

// Subscribe to state changes and persist to the file via Server Action
useTemplateStore.subscribe((state, prevState) => {
  if (state.templates !== prevState.templates) {
    saveTemplatesToFile(state.templates).catch(console.error);
  }
});
