'use client';

import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import type { RJSFSchema, RJSFValidationError, UiSchema } from '@rjsf/utils';
import { useState } from 'react';
import { fieldTemplates, templates, widgets } from './widgets';

type ErrorMessageOptions = Partial<Record<'required' | 'minLength' | 'maxLength' | 'minimum' | 'maximum' | 'pattern' | 'custom', string>>;

function collectErrorMessages(uiSchema: UiSchema): Record<string, ErrorMessageOptions> {
  const out: Record<string, ErrorMessageOptions> = {};
  for (const [key, value] of Object.entries(uiSchema)) {
    if (key.startsWith('ui:')) continue;
    const node = value as UiSchema & { 'ui:options'?: { errorMessages?: ErrorMessageOptions } };
    const errorMessages = node?.['ui:options']?.errorMessages;
    if (errorMessages) out[key] = errorMessages;
    if (node && typeof node === 'object') Object.assign(out, collectErrorMessages(node as UiSchema));
  }
  return out;
}

const KEYWORD_MAP: Record<string, keyof ErrorMessageOptions> = {
  required: 'required',
  minLength: 'minLength',
  maxLength: 'maxLength',
  minimum: 'minimum',
  maximum: 'maximum',
  pattern: 'pattern',
};

export function LivePreview({
  schema,
  uiSchema,
  defaultValues,
  onFormDataChange,
}: {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  defaultValues: Record<string, unknown>;
  onFormDataChange?: (formData: Record<string, unknown>) => void;
}) {
  const [formData, setFormData] = useState<Record<string, unknown>>(defaultValues);
  const customMessages = collectErrorMessages(uiSchema);

  function transformErrors(errors: RJSFValidationError[]) {
    return errors.map((error) => {
      const key = (error.property ?? '').replace(/^\./, '').split('.')[0];
      const mappedKeyword = KEYWORD_MAP[error.name ?? ''];
      const message = mappedKeyword && customMessages[key]?.[mappedKeyword];
      return message ? { ...error, message } : error;
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        validator={validator}
        widgets={widgets}
        templates={{ ...templates, ...fieldTemplates }}
        formContext={{ rootFormData: formData }}
        transformErrors={transformErrors}
        onChange={(e) => {
          const next = e.formData ?? {};
          setFormData(next);
          onFormDataChange?.(next);
        }}
      >
        <div />
      </Form>
    </div>
  );
}
