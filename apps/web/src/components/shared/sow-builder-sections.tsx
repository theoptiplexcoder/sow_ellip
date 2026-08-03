'use client';

import { useEffect, useState } from 'react';
import { Input, Label, Textarea, cn } from '@sow-platform/ui';
import type { Sow } from '@/lib/data/sows';
import { DocxRichTextField } from './docx-rich-text-field';

const sections = [
  'Objectives',
  'Scope',
  'Deliverables',
  'Milestones',
  'Pricing',
  'Acceptance Criteria',
  'Dependencies',
  'Risks',
  'Assumptions',
  'Notes',
] as const;

type Section = (typeof sections)[number];

export function SowBuilderSections({
  sow,
  onDraftChange,
  layout = 'split',
}: {
  sow: Sow;
  onDraftChange?: (sections: Sow['sections']) => void;
  layout?: 'split' | 'column';
}) {
  const [active, setActive] = useState<Section>('Objectives');
  const [draft, setDraft] = useState<Sow['sections']>(sow.sections);

  useEffect(() => {
    onDraftChange?.(draft);
  }, [draft]);

  return (
    <div
      className={cn(
        'gap-4',
        layout === 'column'
          ? 'flex flex-col'
          : 'grid gap-6 lg:grid-cols-[200px_1fr]',
      )}
    >
      <nav
        className={cn(
          'flex gap-1',
          layout === 'column'
            ? 'flex-wrap'
            : 'overflow-x-auto lg:flex-col lg:overflow-visible',
        )}
      >
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={cn(
              'shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
              active === s
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {s}
          </button>
        ))}
      </nav>

      <div className="min-w-0 rounded-md border p-4">
        {active === 'Objectives' && (
          <div className="flex flex-col gap-2">
            <Label>Objectives</Label>
            <Textarea
              value={draft.objectives}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => setDraft((d) => ({ ...d, objectives: e.target.value }))}
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Scope' && (
          <DocxRichTextField label="Scope" defaultValue={sow.sections.scope} />
        )}

        {active === 'Deliverables' && (
          <div className="flex flex-col gap-2">
            <Label>Deliverables</Label>
            <ul className="flex flex-col gap-2">
              {draft.deliverables.map((d, i) => (
                <Input
                  key={i}
                  value={d}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) =>
                    setDraft((prev) => ({
                      ...prev,
                      deliverables: prev.deliverables.map((item, idx) =>
                        idx === i ? e.target.value : item,
                      ),
                    }))
                  }
                />
              ))}
            </ul>
          </div>
        )}

        {active === 'Milestones' && (
          <div className="flex flex-col gap-3">
            <Label>Milestones</Label>
            {draft.milestones.map((m, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={m.name}
                  placeholder="Milestone name"
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) =>
                    setDraft((prev) => ({
                      ...prev,
                      milestones: prev.milestones.map((item, idx) =>
                        idx === i ? { ...item, name: e.target.value } : item,
                      ),
                    }))
                  }
                />
                <Input
                  value={m.dueDate}
                  type="date"
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) =>
                    setDraft((prev) => ({
                      ...prev,
                      milestones: prev.milestones.map((item, idx) =>
                        idx === i ? { ...item, dueDate: e.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>
            ))}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Period of Performance — Start
                </Label>
                <Input
                  value={draft.periodStart}
                  type="date"
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => setDraft((d) => ({ ...d, periodStart: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Period of Performance — End
                </Label>
                <Input
                  value={draft.periodEnd}
                  type="date"
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) => setDraft((d) => ({ ...d, periodEnd: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {active === 'Pricing' && (
          <div className="flex flex-col gap-2">
            <Label>Pricing</Label>
            {draft.pricing.map((p, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  value={p.item}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) =>
                    setDraft((prev) => ({
                      ...prev,
                      pricing: prev.pricing.map((item, idx) =>
                        idx === i ? { ...item, item: e.target.value } : item,
                      ),
                    }))
                  }
                />
                <Input
                  value={p.amount}
                  onChange={(
                    e: React.ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement
                    >,
                  ) =>
                    setDraft((prev) => ({
                      ...prev,
                      pricing: prev.pricing.map((item, idx) =>
                        idx === i ? { ...item, amount: e.target.value } : item,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}

        {active === 'Acceptance Criteria' && (
          <div className="flex flex-col gap-2">
            <Label>Acceptance Criteria</Label>
            <Textarea
              value={draft.acceptanceCriteria}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) =>
                setDraft((d) => ({ ...d, acceptanceCriteria: e.target.value }))
              }
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Dependencies' && (
          <div className="flex flex-col gap-2">
            <Label>Dependencies</Label>
            <Textarea
              value={draft.dependencies}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => setDraft((d) => ({ ...d, dependencies: e.target.value }))}
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Risks' && (
          <div className="flex flex-col gap-2">
            <Label>Risks</Label>
            <Textarea
              value={draft.risks}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => setDraft((d) => ({ ...d, risks: e.target.value }))}
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Assumptions' && (
          <DocxRichTextField
            label="Assumptions"
            defaultValue={sow.sections.assumptions}
          />
        )}

        {active === 'Notes' && (
          <DocxRichTextField label="Notes" defaultValue={sow.sections.notes} />
        )}
      </div>
    </div>
  );
}
