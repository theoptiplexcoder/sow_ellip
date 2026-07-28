import { test, expect } from '@playwright/test';

test.describe('admin workflows page', () => {
  test('lists existing workflows with ordered steps', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    await expect(page.getByRole('heading', { name: 'Workflows' })).toBeVisible();
    await expect(page.getByText('Standard 2-step')).toBeVisible();
    await expect(page.getByText(/Manager review/)).toBeVisible();
  });

  test('creates a workflow with multiple ordered steps', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    await page.getByRole('button', { name: 'New workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Legal review');
    await dialog.getByPlaceholder('Step label').fill('Legal check');
    await dialog.getByRole('button', { name: 'Add step' }).click();
    await dialog.getByPlaceholder('Step label').nth(1).fill('Final sign-off');
    await dialog.getByRole('button', { name: 'Create workflow' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Legal review')).toBeVisible();
    await expect(page.getByText(/1\. Legal check/)).toBeVisible();
    await expect(page.getByText(/2\. Final sign-off/)).toBeVisible();
  });

  test('sets a role for each person added to a step', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    await page.getByRole('button', { name: 'New workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Role-tagged workflow');
    await dialog.getByPlaceholder('Step label').fill('Legal check');

    const stepRow = dialog.locator('.rounded-md.border').first();
    await expect(stepRow.getByRole('combobox').nth(1)).toHaveText('Approver');
    await stepRow.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Viewer' }).click();
    await expect(stepRow.getByRole('combobox').nth(1)).toHaveText('Viewer');

    await dialog.getByRole('button', { name: 'Create workflow' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Role-tagged workflow')).toBeVisible();
  });

  test('rejects a duplicate workflow name within the org', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    await page.getByRole('button', { name: 'New workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Standard 2-step');
    await dialog.getByPlaceholder('Step label').fill('Step one');
    await dialog.getByRole('button', { name: 'Create workflow' }).click();

    await expect(dialog.getByText(/already exists/)).toBeVisible();
  });

  test('toggles a workflow active state', async ({ page }) => {
    await page.goto('/tenantSlug/admin/workflows');
    const row = page.locator('tr').filter({ hasText: 'Single approver' });
    await row.getByRole('switch').click();
    await expect(row.getByText('Active', { exact: true })).toBeVisible();
  });
});
