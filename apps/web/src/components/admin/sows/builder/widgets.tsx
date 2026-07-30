'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  BaseInputTemplateProps,
  ObjectFieldTemplateProps,
  WidgetProps,
} from '@rjsf/utils';
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { Switch } from '../../../ui/switch';
import { evaluateFormula } from './formulaEngine';
import { computeFieldEffects, type TargetRule } from './conditionalEngine';
import { directoryOptions } from './mockDirectory';
import type { LayoutNode } from './fieldTypes';

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

export function TextareaWidget({ id, value, required, disabled, readonly, placeholder, onChange }: WidgetProps) {
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
                  const next = e.target.checked ? [...selected, opt.value] : selected.filter((v) => v !== opt.value);
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
  return <Switch checked={!!value} onCheckedChange={(checked) => !disabled && !readonly && onChange(checked)} label={label} />;
}

export function CurrencyWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <input
        id={id}
        type="number"
        step="0.01"
        className={cn(FIELD_CLASSES, 'pl-6')}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </div>
  );
}

export function PercentageWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  return (
    <div className="relative">
      <input
        id={id}
        type="number"
        min={0}
        max={100}
        className={cn(FIELD_CLASSES, 'pr-7')}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
    </div>
  );
}

export function LookupWidget({ id, value, disabled, readonly, onChange, options }: WidgetProps) {
  const lookupType = (options.lookupType as string) ?? '';
  const items = directoryOptions(lookupType);
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
      {items.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

const RICH_TEXT_COMMANDS: { label: string; command: string }[] = [
  { label: 'B', command: 'bold' },
  { label: 'I', command: 'italic' },
  { label: 'U', command: 'underline' },
  { label: '• List', command: 'insertUnorderedList' },
];

export function RichTextWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value ?? '')) ref.current.innerHTML = value ?? '';
  }, [value]);

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex gap-1 border-b border-border p-1.5">
        {RICH_TEXT_COMMANDS.map((c) => (
          <button
            key={c.command}
            type="button"
            disabled={disabled || readonly}
            className="rounded px-2 py-1 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-50"
            onMouseDown={(e) => {
              e.preventDefault();
              document.execCommand(c.command);
              if (ref.current) onChange(ref.current.innerHTML);
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div
        id={id}
        ref={ref}
        contentEditable={!disabled && !readonly}
        className="min-h-24 px-3 py-2 text-sm text-foreground focus:outline-none"
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        suppressContentEditableWarning
      />
    </div>
  );
}

function renderMarkdown(src: string): string {
  const escaped = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .split('\n')
    .map((line) => {
      if (/^###\s+/.test(line)) return `<h3>${line.replace(/^###\s+/, '')}</h3>`;
      if (/^##\s+/.test(line)) return `<h2>${line.replace(/^##\s+/, '')}</h2>`;
      if (/^#\s+/.test(line)) return `<h1>${line.replace(/^#\s+/, '')}</h1>`;
      if (/^-\s+/.test(line)) return `<li>${line.replace(/^-\s+/, '')}</li>`;
      return line ? `<p>${line}</p>` : '<br/>';
    })
    .join('')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

export function MarkdownWidget({ id, value, disabled, readonly, placeholder, onChange }: WidgetProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <textarea
        id={id}
        rows={6}
        className={cn(FIELD_CLASSES, 'font-mono text-xs')}
        value={value ?? ''}
        placeholder={placeholder ?? 'Markdown source...'}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      />
      <div
        className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(value ?? '') }}
      />
    </div>
  );
}

export function SignatureWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, [value]);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function commit() {
    if (canvasRef.current) onChange(canvasRef.current.toDataURL('image/png'));
  }

  return (
    <div className="space-y-2">
      <canvas
        id={id}
        ref={canvasRef}
        width={360}
        height={120}
        className={cn('w-full max-w-sm cursor-crosshair rounded-md border border-border bg-white', (disabled || readonly) && 'opacity-60')}
        onPointerDown={(e) => {
          if (disabled || readonly) return;
          drawing.current = true;
          const ctx = canvasRef.current?.getContext('2d');
          const { x, y } = pos(e);
          ctx?.beginPath();
          ctx?.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current || disabled || readonly) return;
          const ctx = canvasRef.current?.getContext('2d');
          const { x, y } = pos(e);
          if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#111827';
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }}
        onPointerUp={() => {
          drawing.current = false;
          commit();
        }}
        onPointerLeave={() => {
          if (drawing.current) {
            drawing.current = false;
            commit();
          }
        }}
      />
      {!disabled && !readonly && (
        <button
          type="button"
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
            onChange(undefined);
          }}
        >
          Clear signature
        </button>
      )}
    </div>
  );
}

const APPROVAL_STATES = ['Pending', 'Approved', 'Rejected'] as const;
const APPROVAL_CLASSES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Approved: 'bg-green-100 text-green-800 border-green-300',
  Rejected: 'bg-red-100 text-red-800 border-red-300',
};

export function ApprovalWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  return (
    <div id={id} className="flex flex-wrap gap-2">
      {APPROVAL_STATES.map((state) => (
        <button
          key={state}
          type="button"
          disabled={disabled || readonly}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50',
            value === state ? APPROVAL_CLASSES[state] : 'border-border bg-card text-muted-foreground hover:bg-accent',
          )}
          onClick={() => onChange(state)}
        >
          {state}
        </button>
      ))}
    </div>
  );
}

const STATUS_TONES = ['bg-slate-100 text-slate-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700'];

export function StatusWidget({ id, value, disabled, readonly, onChange, options }: WidgetProps) {
  const enumOptions = (options.enumOptions ?? []) as { value: string; label: string }[];
  return (
    <div className="flex items-center gap-2">
      <select
        id={id}
        className={FIELD_CLASSES}
        value={value ?? ''}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
      >
        {enumOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {value && (
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', STATUS_TONES[enumOptions.findIndex((o) => o.value === value) % STATUS_TONES.length])}>
          {value}
        </span>
      )}
    </div>
  );
}

export function TagsWidget({ id, value, disabled, readonly, onChange }: WidgetProps) {
  const tags: string[] = Array.isArray(value) ? value : [];
  const [draft, setDraft] = useState('');

  function addTag() {
    const t = draft.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft('');
  }

  return (
    <div id={id} className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-card p-2">
      {tags.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
          {tag}
          {!disabled && !readonly && (
            <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}>
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      {!disabled && !readonly && (
        <input
          className="min-w-24 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          value={draft}
          placeholder="Add tag, press Enter"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            } else if (e.key === 'Backspace' && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={addTag}
        />
      )}
    </div>
  );
}

export function FormulaWidget({ id, value, options, formContext }: WidgetProps) {
  const expression = (options.expression as string) ?? '';
  const context = (formContext as { rootFormData?: Record<string, unknown> } | undefined)?.rootFormData ?? {};
  const computed = evaluateFormula(expression, context);

  return (
    <input
      id={id}
      readOnly
      className={cn(FIELD_CLASSES, 'bg-muted/40 font-medium')}
      value={computed ?? (typeof value === 'number' ? value : '')}
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
  currency: CurrencyWidget,
  percentage: PercentageWidget,
  richtext: RichTextWidget,
  markdown: MarkdownWidget,
  signature: SignatureWidget,
  approval: ApprovalWidget,
  status: StatusWidget,
  tags: TagsWidget,
  formula: FormulaWidget,
  lookup: LookupWidget,
};

const WIDTH_CLASS: Record<string, string> = {
  '25': 'basis-full sm:basis-[calc(25%-0.75rem)]',
  '50': 'basis-full sm:basis-[calc(50%-0.75rem)]',
  '75': 'basis-full sm:basis-[calc(75%-0.75rem)]',
  '100': 'basis-full',
};

function useConditionalEffects(target: string, rules: TargetRule[] | undefined, rootFormData: Record<string, unknown>) {
  if (!rules?.length) return {};
  return computeFieldEffects(rules, rootFormData);
}

function LayoutFields({
  nodes,
  properties,
  rootFormData,
}: {
  nodes: LayoutNode[];
  properties: ObjectFieldTemplateProps['properties'];
  rootFormData: Record<string, unknown>;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {nodes.map((node, i) => {
        if (node.kind === 'heading') return <h3 key={i} className="w-full text-base font-semibold text-foreground">{node.text}</h3>;
        if (node.kind === 'paragraph') return <p key={i} className="w-full text-sm text-muted-foreground">{node.text}</p>;
        if (node.kind === 'divider') return <hr key={i} className="w-full border-border" />;

        if (node.kind === 'section') {
          return (
            <div key={i} className="w-full">
              {node.title && <h4 className="mb-3 text-sm font-semibold text-foreground">{node.title}</h4>}
              <LayoutFields nodes={node.children} properties={properties} rootFormData={rootFormData} />
            </div>
          );
        }
        if (node.kind === 'card') {
          return (
            <div key={i} className="w-full rounded-lg border border-border bg-card p-4 shadow-sm">
              {node.title && <h4 className="mb-3 text-sm font-semibold text-foreground">{node.title}</h4>}
              <LayoutFields nodes={node.children} properties={properties} rootFormData={rootFormData} />
            </div>
          );
        }

        if (node.kind === 'accordion') return <AccordionGroup key={i} node={node} properties={properties} rootFormData={rootFormData} />;
        if (node.kind === 'tabs') return <TabsGroup key={i} node={node} properties={properties} rootFormData={rootFormData} />;

        const prop = properties.find((p) => p.name === node.key);
        if (!prop) return null;
        const contentProps = prop.content.props as { uiSchema?: Record<string, unknown> } | undefined;
        const uiOptions = ((contentProps?.uiSchema?.['ui:options'] as { conditional?: TargetRule[] } | undefined) ?? {});
        const effects = useConditionalEffects(node.key, uiOptions.conditional, rootFormData);
        if (effects.hidden) return null;
        return (
          <div key={node.key} className={WIDTH_CLASS[node.width] ?? WIDTH_CLASS['100']}>
            {prop.content}
          </div>
        );
      })}
    </div>
  );
}

function AccordionGroup({
  node,
  properties,
  rootFormData,
}: {
  node: Extract<LayoutNode, { kind: 'accordion' }>;
  properties: ObjectFieldTemplateProps['properties'];
  rootFormData: Record<string, unknown>;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="w-full divide-y divide-border rounded-lg border border-border">
      {node.panels.map((panel, i) => (
        <div key={i}>
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/40"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {panel.title}
            {open === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {open === i && (
            <div className="p-4 pt-0">
              <LayoutFields nodes={panel.children} properties={properties} rootFormData={rootFormData} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TabsGroup({
  node,
  properties,
  rootFormData,
}: {
  node: Extract<LayoutNode, { kind: 'tabs' }>;
  properties: ObjectFieldTemplateProps['properties'];
  rootFormData: Record<string, unknown>;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full">
      <div className="mb-3 flex gap-1 border-b border-border">
        {node.panels.map((panel, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              'border-b-2 px-3 py-2 text-sm font-medium',
              active === i ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setActive(i)}
          >
            {panel.title}
          </button>
        ))}
      </div>
      <LayoutFields nodes={node.panels[active]?.children ?? []} properties={properties} rootFormData={rootFormData} />
    </div>
  );
}

export function ObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const layout = (props.uiSchema?.['ui:layout'] as LayoutNode[]) ?? null;
  const rootFormData = ((props.registry.formContext as { rootFormData?: Record<string, unknown> } | undefined)?.rootFormData ??
    props.formData ??
    {}) as Record<string, unknown>;

  if (!layout) {
    return (
      <div className="flex flex-wrap gap-4">
        {props.properties.map((p) => (
          <div key={p.name} className="basis-full">
            {p.content}
          </div>
        ))}
      </div>
    );
  }

  return <LayoutFields nodes={layout} properties={props.properties} rootFormData={rootFormData} />;
}

function TableArrayField({ props }: { props: ArrayFieldTemplateProps }) {
  return (
    <div className="space-y-2">
      {props.title && <p className="text-sm font-semibold text-foreground">{props.title}</p>}
      <div className="space-y-2">
        {props.items.map((item: ArrayFieldTemplateItemType) => (
          <div key={item.key} className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
            <div className="flex-1">{item.children}</div>
            <div className="flex shrink-0 flex-col gap-1 pt-1">
              {item.hasMoveUp && (
                <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={item.onReorderClick(item.index, item.index - 1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              )}
              {item.hasMoveDown && (
                <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={item.onReorderClick(item.index, item.index + 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              )}
              {item.hasRemove && (
                <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={item.onDropIndexClick(item.index)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {props.canAdd && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
          onClick={props.onAddClick}
        >
          <Plus className="h-3.5 w-3.5" /> Add row
        </button>
      )}
    </div>
  );
}

export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const variant = (props.uiSchema?.['ui:options'] as { variant?: string } | undefined)?.variant;
  if (variant === 'table') return <TableArrayField props={props} />;

  return (
    <div className="space-y-2">
      {props.title && <p className="text-sm font-semibold text-foreground">{props.title}</p>}
      {props.items.map((item: ArrayFieldTemplateItemType) => (
        <div key={item.key} className="flex items-start gap-2 rounded-md border border-border bg-card p-3">
          <div className="flex-1">{item.children}</div>
          <div className="flex shrink-0 flex-col gap-1 pt-1">
            {item.hasMoveUp && (
              <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={item.onReorderClick(item.index, item.index - 1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            )}
            {item.hasMoveDown && (
              <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent" onClick={item.onReorderClick(item.index, item.index + 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            )}
            {item.hasRemove && (
              <button type="button" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-600" onClick={item.onDropIndexClick(item.index)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}
      {props.canAdd && (
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
          onClick={props.onAddClick}
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      )}
    </div>
  );
}

export const fieldTemplates = { ObjectFieldTemplate, ArrayFieldTemplate };

// Re-exported so callers configuring RJSF's transformErrors can render custom messages.
export { Check };
