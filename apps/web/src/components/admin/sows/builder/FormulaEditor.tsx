'use client';

import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { extractFormulaRefs } from './formulaEngine';

type FieldRef = { key: string; title: string };

export function FormulaEditor({
  value,
  fieldRefs,
  onChange,
}: {
  value: string;
  fieldRefs: FieldRef[];
  onChange: (next: string) => void;
}) {
  const refs = extractFormulaRefs(value);
  const unknownRefs = refs.filter((r) => !fieldRefs.some((f) => f.key === r));

  return (
    <div className="space-y-2">
      <Label htmlFor="formula-expression">Formula</Label>
      <Input
        id="formula-expression"
        placeholder="e.g. {hourlyRate} * {hours}"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="text-xs text-muted-foreground">
        Reference other fields with <code>{'{fieldKey}'}</code>. Supports <code>+ - * /</code> and parentheses; date fields are
        compared as a day count, so <code>{'{endDate} - {startDate}'}</code> gives the duration in days.
      </p>
      {unknownRefs.length > 0 && (
        <p className="text-xs text-amber-600">Unknown field reference{unknownRefs.length > 1 ? 's' : ''}: {unknownRefs.join(', ')}</p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {fieldRefs.map((f) => (
          <button
            key={f.key}
            type="button"
            className="rounded-full border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent"
            onClick={() => onChange(`${value}{${f.key}}`)}
          >
            {f.title}
          </button>
        ))}
      </div>
    </div>
  );
}
