import { test, expect } from '@playwright/test';

test.describe('SOW template builder', () => {
  test('adds a field from the palette and configures it in the property panel', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByRole('button', { name: 'Number', exact: true }).click();

    // The canvas row for the newly added field shows its auto-generated key ("field1").
    const fieldRow = page.getByText('field1', { exact: true }).locator('..');
    await expect(fieldRow).toBeVisible();

    await fieldRow.click();
    const labelInput = page.getByLabel('Label');
    await expect(labelInput).toBeVisible();
    await labelInput.fill('Total Budget');

    await expect(page.getByText('Total Budget')).toBeVisible();
  });

  test('adds a Section container and nests a field inside it', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByRole('button', { name: 'Section', exact: true }).click();
    await expect(page.getByText(/Drop fields here to nest them inside/)).toBeVisible();
  });

  test('switches to the live preview and renders the generated form', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await page.getByRole('tab', { name: 'Live preview' }).click();

    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('shows the generated JSON Schema for a new field', async ({ page }) => {
    await page.goto('/tenantSlug/admin/sows/new');

    await page.getByRole('button', { name: 'Text', exact: true }).click();
    await page.getByRole('tab', { name: 'JSON Schema' }).click();

    const schemaText = page.locator('textarea.font-mono');
    await expect(schemaText).toBeVisible();
    await expect(schemaText).toHaveValue(/"type": "object"/);
  });
});
