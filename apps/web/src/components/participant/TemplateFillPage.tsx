'use client';

import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { templates, widgets } from '../admin/sows/builder/widgets';
import { useTemplateStore } from '../admin/sows/templateStore';

export function TemplateFillPage({ templateId }: { templateId: string }) {
  const router = useRouter();
  const template = useTemplateStore((s) => s.templates.find((t) => t.id === templateId));
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null);

  if (!template) {
    return (
      <div>
        <PageHeader title="Template not found" />
        <Button variant="ghost" onClick={() => router.push('/tenantSlug/participant/templates')}>
          Back to templates
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={template.name} description={template.description} />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardContent>
            <Form
              schema={template.jsonSchema}
              uiSchema={template.uiSchema}
              formData={template.defaultValues}
              validator={validator}
              widgets={widgets}
              templates={templates}
              onSubmit={(e) => setSubmitted(e.formData ?? {})}
            >
              <div className="pt-4">
                <Button type="submit">Use this template</Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        {submitted && (
          <p className="mt-4 text-sm text-muted-foreground">
            Form answers captured. SOW creation from these answers will be wired up once the backend is ready.
          </p>
        )}
      </div>
    </div>
  );
}
