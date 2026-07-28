import { test, expect } from '@playwright/test';

test.describe('admin projects page', () => {
  test('lists existing projects with client, owner and status', async ({ page }) => {
    await page.goto('/tenantSlug/admin/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByText('Website revamp')).toBeVisible();
    await expect(page.getByText('Active').first()).toBeVisible();
  });

  test('creates a new project scoped to a client and owner', async ({ page }) => {
    await page.goto('/tenantSlug/admin/projects');
    await page.getByRole('button', { name: 'New project' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Name').fill('New onboarding flow');
    await dialog.getByRole('button', { name: 'Create project' }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('New onboarding flow')).toBeVisible();
  });

  test('edits an existing project status', async ({ page }) => {
    await page.goto('/tenantSlug/admin/projects');
    const row = page.locator('tr').filter({ hasText: 'Data migration' });
    await row.getByRole('button', { name: 'Edit' }).click();

    const dialog = page.getByRole('dialog');
    await dialog.getByRole('combobox').nth(2).click();
    await page.getByRole('option', { name: 'Completed' }).click();
    await dialog.getByRole('button', { name: 'Save changes' }).click();

    await expect(row.getByText('Completed')).toBeVisible();
  });

  test('opens a side panel listing SOWs when a project row is clicked', async ({ page }) => {
    await page.goto('/tenantSlug/admin/projects');
    const row = page.locator('tr').filter({ hasText: 'Website revamp' });
    await row.click();

    const panel = page.locator('aside');
    await expect(panel).toBeVisible();
    await expect(panel.getByText('SOW-1042')).toBeVisible();
    await expect(panel.getByText('SOW-1048')).toBeVisible();

    await panel.getByRole('button', { name: 'Close' }).click();
    await expect(panel).toBeHidden();
  });
});
