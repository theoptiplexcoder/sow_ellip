import { test, expect } from '@playwright/test';

test.describe('admin template builder', () => {
  test('New SOW opens a full-page document editor, not a modal', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows');
    await page.getByRole('button', { name: 'New SOW' }).click();

    await expect(page).toHaveURL(/\/sows\/new$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'New template' })).toBeVisible();
  });

  test('adds a field, sees it in the live preview, and saves the template', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByLabel('Name').fill('Playwright Test Template');

    await page.getByRole('button', { name: 'Add field' }).click();
    await page.getByLabel('Title').fill('Client budget');
    await page.getByLabel('Field type').selectOption('number');

    await page.getByRole('tab', { name: 'Live preview' }).click();
    await expect(page.getByText('Client budget')).toBeVisible();

    await page.getByRole('button', { name: 'Create template' }).click();
    await expect(page).toHaveURL(/\/sows$/);
  });

  test('creates a template by pasting a raw JSON Schema', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByLabel('Name').fill('Schema Authored Template');

    await page.getByRole('tab', { name: 'JSON Schema' }).click();
    const schemaTextarea = page.locator('textarea');
    await schemaTextarea.fill(
      JSON.stringify({
        jsonSchema: {
          type: 'object',
          properties: { clientName: { type: 'string', title: 'Client name' } },
          required: ['clientName'],
        },
        uiSchema: {},
        defaultValues: {},
      }),
    );

    await page.getByRole('tab', { name: 'Live preview' }).click();
    await expect(page.getByText('Client name')).toBeVisible();

    await page.getByRole('button', { name: 'Create template' }).click();
    await expect(page).toHaveURL(/\/sows$/);
  });
});
