'use client';

import { useState } from 'react';
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

export function SowBuilderSections({ sow }: { sow: Sow }) {
  const [active, setActive] = useState<Section>('Objectives');

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
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
              defaultValue={sow.sections.objectives}
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
              {sow.sections.deliverables.map((d, i) => (
                <Input key={i} defaultValue={d} />
              ))}
            </ul>
          </div>
        )}

        {active === 'Milestones' && (
          <div className="flex flex-col gap-3">
            <Label>Milestones</Label>
            {sow.sections.milestones.map((m, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input defaultValue={m.name} placeholder="Milestone name" />
                <Input defaultValue={m.dueDate} type="date" />
              </div>
            ))}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Period of Performance — Start
                </Label>
                <Input defaultValue={sow.sections.periodStart} type="date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">
                  Period of Performance — End
                </Label>
                <Input defaultValue={sow.sections.periodEnd} type="date" />
              </div>
            </div>
          </div>
        )}

        {active === 'Pricing' && (
          <div className="flex flex-col gap-2">
            <Label>Pricing</Label>
            {sow.sections.pricing.map((p, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input defaultValue={p.item} />
                <Input defaultValue={p.amount} />
              </div>
            ))}
          </div>
        )}

        {active === 'Acceptance Criteria' && (
          <div className="flex flex-col gap-2">
            <Label>Acceptance Criteria</Label>
            <Textarea
              defaultValue={sow.sections.acceptanceCriteria}
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Dependencies' && (
          <div className="flex flex-col gap-2">
            <Label>Dependencies</Label>
            <Textarea
              defaultValue={sow.sections.dependencies}
              className="min-h-32"
            />
          </div>
        )}

        {active === 'Risks' && (
          <div className="flex flex-col gap-2">
            <Label>Risks</Label>
            <Textarea defaultValue={sow.sections.risks} className="min-h-32" />
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
