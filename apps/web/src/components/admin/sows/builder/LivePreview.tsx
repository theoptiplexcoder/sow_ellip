'use client';

import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { useState } from 'react';
import { templates, widgets } from './widgets';

export function LivePreview({
  schema,
  uiSchema,
  defaultValues,
}: {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  defaultValues: Record<string, unknown>;
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        widgets={widgets}
        templates={templates}
        onChange={(e) => setFormData(e.formData ?? {})}
      >
        <div />
      </Form>
    </div>
  );
}
