import { test, expect } from '@playwright/test';

test.describe('admin audit log page', () => {
  test('lists audit events', async ({ page }) => {
    await page.goto('/tenantSlug/admin/auditlogs');
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
    await expect(page.getByText('USER_INVITED')).toBeVisible();
  });

  test('filters audit events by entity type', async ({ page }) => {
    await page.goto('/tenantSlug/admin/auditlogs');
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Workflow' }).click();

    await expect(page.getByText('WORKFLOW_ACTIVATED')).toBeVisible();
    await expect(page.getByText('USER_INVITED')).toBeHidden();
  });

  test('filters audit events by actor', async ({ page }) => {
    await page.goto('/tenantSlug/admin/auditlogs');
    await page.getByLabel('Actor').fill('Dana');

    await expect(page.getByText('SOW_APPROVED')).toBeVisible();
    await expect(page.getByText('USER_INVITED')).toBeHidden();
  });
});
