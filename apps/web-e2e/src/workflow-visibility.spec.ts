import { test, expect } from '@playwright/test';

test.describe('workflow and workflow-template visibility across roles', () => {
  test('a workflow created in the admin Workflow Yard appears in the participant Workflow Yard', async ({ page }) => {
    const name = `E2E Admin Yard Workflow ${Date.now()}`;

    await page.goto('/tenantSlug/admin/workflowyard');
    await page.getByRole('button', { name: 'New workflow' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill(name);
    await dialog.getByPlaceholder('Step label').fill('Review');
    await dialog.getByRole('button', { name: 'Create workflow' }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.goto('/tenantSlug/participant/workflows/yard');
    await expect(page.getByText(name)).toBeVisible();
  });

  test('a workflow created in the admin Workflows page appears in the participant Workflows page', async ({ page }) => {
    const name = `E2E Admin Workflow ${Date.now()}`;

    await page.goto('/tenantSlug/admin/workflows');
    await page.getByRole('button', { name: 'New workflow' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill(name);
    await dialog.getByPlaceholder('Step label').fill('Review');
    await dialog.getByRole('button', { name: 'Create workflow' }).click();
    await expect(page.getByText(name)).toBeVisible();

    await page.goto('/tenantSlug/participant/workflows');
    await expect(page.getByText(name)).toBeVisible();
  });
});
