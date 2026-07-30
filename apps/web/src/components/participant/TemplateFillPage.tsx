'use client';

import Form from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import { useRouter } from 'next/navigation';
import { PageHeader } from '../ui/page-header';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { templates, widgets } from '../admin/sows/builder/widgets';
import { useTemplateStore } from '../admin/sows/templateStore';
import { useSowStore } from '../admin/sows/sowStore';

export function TemplateFillPage({ templateId }: { templateId: string }) {
  const router = useRouter();
  const template = useTemplateStore((s) => s.templates.find((t) => t.id === templateId));
  const addSow = useSowStore((s) => s.addSow);

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

  const tpl = template;

  function createSow(formData: Record<string, unknown>) {
    const title = (formData.projectTitle as string)?.trim() || tpl.name;
    const description =
      (formData.projectDescription as string) || (formData.overview as string) || tpl.description || '';
    addSow({ title, project: title, description, templateId: tpl.id, formData });
    router.push('/tenantSlug/participant/sows/yard');
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
              onSubmit={(e) => createSow(e.formData ?? {})}
            >
              <div className="pt-4">
                <Button type="submit">Use this template</Button>
              </div>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
