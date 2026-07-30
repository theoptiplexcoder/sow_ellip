'use client';

import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { NUMERIC_KINDS, TEXT_LENGTH_KINDS, type FieldKind, type ValidationRule } from './types';

export function ValidationEditor({
  kind,
  value,
  onChange,
}: {
  kind: FieldKind;
  value: ValidationRule | undefined;
  onChange: (next: ValidationRule) => void;
}) {
  const v = value ?? {};
  const showLength = TEXT_LENGTH_KINDS.includes(kind);
  const showRange = NUMERIC_KINDS.includes(kind);

  function set(patch: Partial<ValidationRule>) {
    onChange({ ...v, ...patch });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {showLength && (
          <>
            <div>
              <Label htmlFor="val-minlength">Min length</Label>
              <Input
                id="val-minlength"
                type="number"
                value={v.minLength ?? ''}
                onChange={(e) => set({ minLength: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="val-maxlength">Max length</Label>
              <Input
                id="val-maxlength"
                type="number"
                value={v.maxLength ?? ''}
                onChange={(e) => set({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </>
        )}
        {showRange && (
          <>
            <div>
              <Label htmlFor="val-min">Minimum value</Label>
              <Input
                id="val-min"
                type="number"
                value={v.minimum ?? ''}
                onChange={(e) => set({ minimum: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="val-max">Maximum value</Label>
              <Input
                id="val-max"
                type="number"
                value={v.maximum ?? ''}
                onChange={(e) => set({ maximum: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </>
        )}
        <div className="col-span-2">
          <Label htmlFor="val-pattern">Regex pattern</Label>
          <Input id="val-pattern" value={v.pattern ?? ''} onChange={(e) => set({ pattern: e.target.value || undefined })} />
        </div>
        <div className="col-span-2">
          <Label htmlFor="val-custom">Custom validation function</Label>
          <Input
            id="val-custom"
            placeholder="e.g. value % 1 === 0 || 'Must be a whole number'"
            value={v.customValidator ?? ''}
            onChange={(e) => set({ customValidator: e.target.value || undefined })}
          />
          <p className="mt-1 text-xs text-muted-foreground">Stored with the template for server-side enforcement; not executed in the browser.</p>
        </div>
        <div className="col-span-2">
          <Label htmlFor="val-error-required">Required error message</Label>
          <Input
            id="val-error-required"
            value={v.errorMessages?.required ?? ''}
            onChange={(e) => set({ errorMessages: { ...v.errorMessages, required: e.target.value || undefined } })}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="val-error-pattern">Pattern error message</Label>
          <Input
            id="val-error-pattern"
            value={v.errorMessages?.pattern ?? ''}
            onChange={(e) => set({ errorMessages: { ...v.errorMessages, pattern: e.target.value || undefined } })}
          />
        </div>
      </div>
    </div>
  );
}
