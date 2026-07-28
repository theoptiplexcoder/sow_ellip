'use client';

import type { BaseInputTemplateProps, WidgetProps } from '@rjsf/utils';
import { cn } from '../../../../lib/cn';
import { Switch } from '../../../ui/switch';

const FIELD_CLASSES =
  'w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60';

export function BaseInputTemplate({
  id,
  value,
  required,
  disabled,
  readonly,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  schema,
  type,
}: BaseInputTemplateProps) {
  const inputType =
    type === 'number' || schema.type === 'number' || schema.type === 'integer'
      ? 'number'
      : schema.format === 'email'
        ? 'email'
        : schema.format === 'uri'
          ? 'url'
          : schema.format === 'date'
            ? 'date'
            : schema.format === 'time'
              ? 'time'
              : schema.format === 'date-time'
                ? 'datetime-local'
                : schema.format === 'data-url'
                  ? 'file'
                  : 'text';

  return (
    <input
      id={id}
      className={cn(FIELD_CLASSES)}
      type={inputType}
      value={inputType === 'file' ? undefined : (value ?? '')}
      required={required}
      disabled={disabled || readonly}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      onBlur={onBlur && ((e) => onBlur(id, e.target.value))}
      onFocus={onFocus && ((e) => onFocus(id, e.target.value))}
    />
  );
}

export function TextareaWidget({
  id,
  value,
  required,
  disabled,
  readonly,
  placeholder,
  onChange,
}: WidgetProps) {
  return (
    <textarea
      id={id}
      rows={4}
      className={FIELD_CLASSES}
      value={value ?? ''}
      required={required}
      disabled={disabled || readonly}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
    />
  );
}

export function SelectWidget({ id, value, disabled, readonly, multiple, onChange, options }: WidgetProps) {
  const enumOptions = (options.enumOptions ?? []) as { value: string; label: string }[];

  if (multiple) {
    return (
      <div className="space-y-1.5">
        {enumOptions.map((opt) => {
          const selected: string[] = Array.isArray(value) ? value : [];
          const checked = selected.includes(opt.value);
          return (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled || readonly}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, opt.value]
                    : selected.filter((v) => v !== opt.value);
                  onChange(next);
                }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <select
      id={id}
      className={FIELD_CLASSES}
      value={value ?? ''}
      disabled={disabled || readonly}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
    >
      <option value="" disabled>
        Select...
      </option>
      {enumOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function RadioWidget({ id, value, disabled, readonly, onChange, options }: WidgetProps) {
  const enumOptions = (options.enumOptions ?? []) as { value: string; label: string }[];
  return (
    <div className="space-y-1.5">
      {enumOptions.map((opt) => (
        <label key={opt.value} className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="radio"
            name={id}
            checked={value === opt.value}
            disabled={disabled || readonly}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </div>
  );
}

export function CheckboxWidget({ id, value, disabled, readonly, onChange, label }: WidgetProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-foreground">
      <input
        id={id}
        type="checkbox"
        checked={!!value}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function SwitchWidget({ id, value, disabled, readonly, onChange, label }: WidgetProps) {
  return (
    <Switch
      checked={!!value}
      onCheckedChange={(checked) => !disabled && !readonly && onChange(checked)}
      label={label}
    />
  );
}

export const templates = { BaseInputTemplate };

export const widgets = {
  TextareaWidget,
  SelectWidget,
  RadioWidget,
  CheckboxWidget,
  switch: SwitchWidget,
};
