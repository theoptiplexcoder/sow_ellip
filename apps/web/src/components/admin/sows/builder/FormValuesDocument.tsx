import type { RJSFSchema } from '@rjsf/utils';

function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map((v) => (typeof v === 'object' && v !== null ? formatValue(v) : String(v))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

type FieldEntry = { key: string; label: string; schema: RJSFSchema };

function fieldEntries(schema: RJSFSchema): FieldEntry[] {
  const properties = (schema.properties ?? {}) as Record<string, RJSFSchema>;
  return Object.entries(properties).map(([key, propSchema]) => ({
    key,
    label: propSchema.title || humanize(key),
    schema: propSchema,
  }));
}

function FieldValue({ entry, formData }: { entry: FieldEntry; formData: Record<string, unknown> }) {
  const value = formData?.[entry.key];
  const isNestedObject = entry.schema.type === 'object' && !!entry.schema.properties;
  const itemSchema = !Array.isArray(entry.schema.items) ? (entry.schema.items as RJSFSchema | undefined) : undefined;
  const isArrayOfObjects = entry.schema.type === 'array' && itemSchema?.type === 'object' && !!itemSchema.properties;

  if (isNestedObject) {
    return (
      <div>
        <h4 className="text-sm font-medium text-foreground">{entry.label}</h4>
        <div className="mt-1 ml-4 space-y-2">
          {fieldEntries(entry.schema).map((child) => (
            <FieldValue key={child.key} entry={child} formData={(value as Record<string, unknown>) ?? {}} />
          ))}
        </div>
      </div>
    );
  }

  if (isArrayOfObjects) {
    const items = Array.isArray(value) ? value : [];
    return (
      <div>
        <h4 className="text-sm font-medium text-foreground">{entry.label}</h4>
        {items.length === 0 ? (
          <p className="mt-1 text-sm text-muted-foreground">—</p>
        ) : (
          <div className="mt-1 ml-4 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="space-y-1">
                {fieldEntries(itemSchema as RJSFSchema).map((child) => (
                  <FieldValue key={child.key} entry={child} formData={(item as Record<string, unknown>) ?? {}} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="text-sm font-medium text-foreground sm:w-48 sm:shrink-0">{entry.label}</span>
      <span className="whitespace-pre-wrap text-sm text-muted-foreground">{formatValue(value)}</span>
    </div>
  );
}

export function FormValuesDocument({
  schema,
  formData,
}: {
  schema: RJSFSchema;
  formData: Record<string, unknown>;
}) {
  const entries = fieldEntries(schema);
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No form fields on this template.</p>;
  }
  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <FieldValue key={entry.key} entry={entry} formData={formData} />
      ))}
    </div>
  );
}
