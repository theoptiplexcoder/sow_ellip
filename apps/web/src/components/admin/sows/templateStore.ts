import { create } from 'zustand';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { buildObjectSchema, draftsToDefaultValues, type FieldDraft } from './builder/fieldTypes';

export type TemplateRow = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  fields: FieldDraft[];
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
  isActive: boolean;
  schemaOverride?: SchemaOverride | null;
};

function fromFields(fields: FieldDraft[]) {
  const { schema, uiSchema } = buildObjectSchema(fields);
  return { jsonSchema: schema, uiSchema, defaultValues: draftsToDefaultValues(fields) };
}

function computeSchema(input: Pick<TemplateInput, 'fields' | 'schemaOverride'>) {
  if (input.schemaOverride) {
    return {
      jsonSchema: input.schemaOverride.jsonSchema,
      uiSchema: input.schemaOverride.uiSchema,
      defaultValues: input.schemaOverride.defaultValues,
    };
  }
  return fromFields(input.fields);
}

type SeedTemplate = Pick<TemplateRow, 'id' | 'name' | 'description' | 'isActive' | 'createdAt' | 'fields'>;

const SEED_INPUT: SeedTemplate[] = [
  {
    id: 't-1',
    name: 'Standard Consulting SOW',
    description: 'General-purpose template for consulting engagements.',
    isActive: true,
    createdAt: '2026-01-10',
    fields: [
      {
        key: 'projectTitle',
        kind: 'shortText',
        title: 'Project Title',
        description: 'The title of the project.',
        required: true,
        readOnly: false,
        hidden: false,
      },
      {
        key: 'projectDescription',
        kind: 'longText',
        title: 'Project Description',
        description: 'Detailed description of the project.',
        required: true,
        readOnly: false,
        hidden: false,
      },
      {
        key: 'overview',
        kind: 'longText',
        title: 'Overview',
        description: 'Summarize the engagement.',
        required: true,
        readOnly: false,
        hidden: false,
        default: 'This SOW outlines...',
      },
      {
        key: 'budget',
        kind: 'number',
        title: 'Budget (USD)',
        required: false,
        readOnly: false,
        hidden: false,
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

const SEED_TEMPLATES: TemplateRow[] = SEED_INPUT.map((t) => ({ ...t, ...fromFields(t.fields) }));

type TemplateStore = {
  templates: TemplateRow[];
  upsertTemplate: (input: TemplateInput) => TemplateRow;
  duplicateTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  toggleActive: (id: string) => void;
};

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: SEED_TEMPLATES,

  upsertTemplate: (input) => {
    const computed = computeSchema(input);
    let saved: TemplateRow;
    set((state) => {
      if (input.id) {
        const templates = state.templates.map((t) =>
          t.id === input.id
            ? { ...t, name: input.name, description: input.description, fields: input.fields, isActive: input.isActive, ...computed }
            : t,
        );
        saved = templates.find((t) => t.id === input.id)!;
        return { templates };
      }
      const row: TemplateRow = {
        id: `t-${Date.now()}`,
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        createdAt: new Date().toISOString().slice(0, 10),
        fields: input.fields,
        ...computed,
      };
      saved = row;
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
      while (state.templates.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
        name = `${source.name} (copy ${i})`;
        i += 1;
      }
      const clone: TemplateRow = {
        ...source,
        id: `t-${Date.now()}`,
        name,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      return { templates: [...state.templates, clone] };
    });
  },

  deleteTemplate: (id) => {
    set((state) => ({ templates: state.templates.filter((t) => t.id !== id) }));
  },

  toggleActive: (id) => {
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)),
    }));
  },
}));

export function getTemplateById(id: string): TemplateRow | undefined {
  return useTemplateStore.getState().templates.find((t) => t.id === id);
}
