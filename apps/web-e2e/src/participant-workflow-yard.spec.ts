import { test, expect } from '@playwright/test';

test.describe('participant workflow yard page', () => {
  test('splits templates into organization and personal sections', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await expect(page.getByRole('heading', { name: 'Workflow Yard' })).toBeVisible();

    await expect(page.getByText('From your organization')).toBeVisible();
    await expect(page.getByText('Standard SOW Approval')).toBeVisible();
    await expect(page.getByText('Quick Approval')).toBeVisible();

    await expect(page.getByText('Created by you')).toBeVisible();
    await expect(page.getByText('Retainer fast-track')).toBeVisible();
  });

  test('duplicates an organization template into the personal section', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');

    const orgRow = page.locator('tr').filter({ hasText: 'Quick Approval' });
    await orgRow.getByRole('button', { name: 'Duplicate to mine' }).click({ force: true });

    await expect(page.getByText('Quick Approval (copy)')).toBeVisible();
  });

  test('creates a personal workflow template with ordered steps', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await page.getByRole('button', { name: 'Create Workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('My legal review');
    await dialog.getByPlaceholder('Step label').fill('Legal check');
    await dialog.getByRole('button', { name: 'Add step' }).click();
    await dialog.getByPlaceholder('Step label').nth(1).fill('Final sign-off');
    await dialog.getByRole('button', { name: 'Create Workflow' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Created by you')).toBeVisible();
    await expect(page.getByText('My legal review')).toBeVisible();
  });

  test('sets a role for each person added to a step', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await page.getByRole('button', { name: 'Create Workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Role-tagged workflow');
    await dialog.getByPlaceholder('Step label').fill('Legal check');

    const stepRow = dialog.locator('.rounded-md.border').first();
    await expect(stepRow.getByRole('combobox').nth(1)).toHaveText('Approver');
    await stepRow.getByRole('combobox').nth(1).click();
    await page.getByRole('option', { name: 'Viewer' }).click();
    await expect(stepRow.getByRole('combobox').nth(1)).toHaveText('Viewer');

    await dialog.getByRole('button', { name: 'Create Workflow' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Role-tagged workflow')).toBeVisible();
  });

  test('rejects a duplicate workflow name', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');
    await page.getByRole('button', { name: 'Create Workflow' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('Standard SOW Approval');
    await dialog.getByPlaceholder('Step label').fill('Step one');
    await dialog.getByRole('button', { name: 'Create Workflow' }).click();

    await expect(dialog.getByText(/already exists/)).toBeVisible();
  });

  test('uses a workflow by selecting a SOW and publishing', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');

    const row = page.locator('tr').filter({ hasText: 'Retainer fast-track' });
    await row.getByRole('button', { name: 'Use' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('Retainer fast-track')).toBeVisible();
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: /Support Retainer Renewal/ }).click();
    await dialog.getByRole('button', { name: 'Publish' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText(/Retainer fast-track.*published to SOW-1055/)).toBeVisible();
  });

  test('only shows edit/delete controls for personal templates', async ({ page }) => {
    await page.goto('/tenantSlug/participant/workflows/yard');

    const orgRow = page.locator('tr').filter({ hasText: 'Standard SOW Approval' });
    await orgRow.click();
    await expect(page.getByRole('button', { name: 'Duplicate to mine' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Template' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Close' }).click();

    const myRow = page.locator('tr').filter({ hasText: 'Retainer fast-track' });
    await myRow.click();
    await expect(page.getByRole('button', { name: 'Edit Template' })).toBeVisible();
  });
});
